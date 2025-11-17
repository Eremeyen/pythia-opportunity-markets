/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Utilities to transform Anchor IDL JSON for code generation.
 * - pruneCallbackInstructions: removes Arcium callback instructions
 * - specializeTypeParameterGenerics: replaces type-parameter generics with concrete, specialized types
 *
 * These transforms are generation-only and do not change on-chain ABI.
 */

export type Logger = (message: string, ...args: any[]) => void;

const defaultLog: Logger = (..._args: any[]) => {};

export const pruneCallbackInstructions = (originalIdl: any, log: Logger = defaultLog): any => {
	const idl = JSON.parse(JSON.stringify(originalIdl));
	if (!Array.isArray(idl.instructions)) return idl;

	const total = idl.instructions.length;
	const pruned: string[] = [];
	const kept: string[] = [];

	const isCallbackIx = (ix: any): boolean => {
		const name: string = ix?.name ?? '';
		if (name.endsWith('_callback')) return true;
		// Also prune instructions whose args include ComputationOutputs<...>
		for (const arg of ix.args ?? []) {
			const def = arg?.type?.defined;
			if (def?.name === 'ComputationOutputs') return true;
		}
		return false;
	};

	for (const ix of idl.instructions) {
		if (isCallbackIx(ix)) pruned.push(ix.name);
		else kept.push(ix.name);
	}
	idl.instructions = idl.instructions.filter((ix: any) => kept.includes(ix.name));

	log(`[IDL] Instructions: total=${total}, pruned=${pruned.length}, kept=${kept.length}`);
	if (pruned.length) log(`[IDL] Pruned callbacks: ${pruned.join(', ')}`);
	return idl;
};

/**
 * Specialize type-parameter generic type definitions (e.g., SetUnset<T>, ComputationOutputs<O>)
 * into concrete types at their usage sites and drop the generic base types.
 *
 * - const generics (e.g., MXEEncryptedStruct<LEN>) are left unchanged.
 * - All newly created specialized types are added to idl.types.
 * - References in instructions and types are rewritten to concrete names.
 */
export const specializeTypeParameterGenerics = (
	originalIdl: any,
	log: Logger = defaultLog,
): any => {
	const idl = JSON.parse(JSON.stringify(originalIdl));
	idl.types = Array.isArray(idl.types) ? idl.types : [];
	idl.instructions = Array.isArray(idl.instructions) ? idl.instructions : [];

	const containsGenericPlaceholder = (node: any): boolean => {
		let found = false;
		const visit = (n: any) => {
			if (!n || typeof n !== 'object' || found) return;
			if (Object.prototype.hasOwnProperty.call(n, 'generic')) {
				found = true;
				return;
			}
			if (Array.isArray(n)) {
				for (const v of n) visit(v);
			} else {
				for (const v of Object.values(n)) visit(v as any);
			}
		};
		visit(node);
		return found;
	};

	const typeDefsByName: Record<string, any> = {};
	for (const t of idl.types) typeDefsByName[t.name] = t;

	const genericTypeParamDefs = new Set(
		idl.types
			.filter(
				(t: any) =>
					Array.isArray(t.generics) && t.generics.some((g: any) => g?.kind === 'type'),
			)
			.map((t: any) => t.name),
	);

	const sanitize = (s: string) => s.replace(/[^A-Za-z0-9_]/g, '_');
	const typeSpecName = (spec: any): string => {
		if (typeof spec === 'string') return sanitize(spec);
		if (spec?.defined?.name) return sanitize(spec.defined.name);
		if (spec?.vec) return `Vec_${typeSpecName(spec.vec)}`;
		if (spec?.option) return `Option_${typeSpecName(spec.option)}`;
		if (Array.isArray(spec?.array)) {
			const [inner, len] = spec.array;
			return `Array_${typeSpecName(inner)}_${String(len)}`;
		}
		return 'Unknown';
	};
	const deepClone = <T>(o: T): T => JSON.parse(JSON.stringify(o));

	const substituteGenerics = (node: any, mapping: Record<string, any>): any => {
		if (node && typeof node === 'object') {
			if (Object.prototype.hasOwnProperty.call(node, 'generic')) {
				const gName = node.generic;
				if (gName && mapping[gName]) {
					return deepClone(mapping[gName]);
				}
			}
			if (Array.isArray(node)) return node.map((child) => substituteGenerics(child, mapping));
			const out: any = {};
			for (const [k, v] of Object.entries(node)) out[k] = substituteGenerics(v, mapping);
			return out;
		}
		return node;
	};

	const createdSpecializations = new Set<string>();

	const ensureSpecializedFromGeneric = (baseName: string, typeArgs: any[]): string => {
		const baseDef = typeDefsByName[baseName];
		if (!baseDef) return baseName;
		const genericParams = Array.isArray(baseDef.generics)
			? baseDef.generics.filter((g: any) => g?.kind === 'type')
			: [];
		const mapping: Record<string, any> = {};
		const argNames: string[] = [];
		for (let i = 0; i < genericParams.length; i++) {
			const paramName: string = genericParams[i]?.name ?? `T${i}`;
			const argSpec = typeArgs[i]?.type ?? typeArgs[i]; // sometimes stored at .type
			mapping[paramName] = argSpec;
			argNames.push(typeSpecName(argSpec));
		}
		const specializedName = sanitize([baseName, ...argNames].join('_'));
		if (!idl.types.some((t: any) => t?.name === specializedName)) {
			const specializedType = substituteGenerics(baseDef.type, mapping);
			idl.types.push({ name: specializedName, type: specializedType });
			createdSpecializations.add(specializedName);
			log(`[GENERIC] Specialized ${baseName}<${argNames.join(', ')}> -> ${specializedName}`);
		}
		return specializedName;
	};

	const rewriteTypeRefs = (node: any): any => {
		if (!node || typeof node !== 'object') return node;
		if (Array.isArray(node)) return node.map(rewriteTypeRefs);

		if (
			node.defined?.name &&
			Array.isArray(node.defined.generics) &&
			genericTypeParamDefs.has(node.defined.name)
		) {
			const baseName: string = node.defined.name;
			const typeArgs: any[] = node.defined.generics;
			const concreteName = ensureSpecializedFromGeneric(baseName, typeArgs);
			return { defined: { name: concreteName } };
		}
		if (node.vec) return { vec: rewriteTypeRefs(node.vec) };
		if (node.option) return { option: rewriteTypeRefs(node.option) };
		if (Array.isArray(node.array)) {
			const [inner, len] = node.array;
			return { array: [rewriteTypeRefs(inner), len] };
		}
		const out: any = {};
		for (const [k, v] of Object.entries(node)) out[k] = rewriteTypeRefs(v);
		return out;
	};

	// Rewrite types and instruction args
	for (const t of idl.types) {
		if (t?.type) t.type = rewriteTypeRefs(t.type);
	}
	for (const ix of idl.instructions) {
		for (const arg of ix.args ?? []) {
			if (arg?.type) arg.type = rewriteTypeRefs(arg.type);
		}
		for (const acc of ix.accounts ?? []) {
			if (acc?.type) acc.type = rewriteTypeRefs(acc.type);
		}
	}

	// Drop generic base type-parameter defs
	const before = idl.types.length;
	idl.types = idl.types.filter(
		(t: any) => !(Array.isArray(t.generics) && t.generics.some((g: any) => g?.kind === 'type')),
	);
	const after = idl.types.length;
	const dropped = before - after;
	log(`[GENERIC] Created specializations: ${createdSpecializations.size}`);
	if (createdSpecializations.size)
		log(`[GENERIC] New types: ${Array.from(createdSpecializations).join(', ')}`);
	log(`[GENERIC] Dropped generic base types (type-parameter): ${dropped}`);

	// Final cleanup: drop any types that still contain generic placeholders.
	const removedNames: string[] = [];
	idl.types = idl.types.filter((t: any) => {
		const hasGen = containsGenericPlaceholder(t.type);
		if (hasGen) removedNames.push(t.name);
		return !hasGen;
	});
	if (removedNames.length) {
		log(`[GENERIC] Dropped types containing generic placeholders: ${removedNames.join(', ')}`);
	}

	return idl;
};
