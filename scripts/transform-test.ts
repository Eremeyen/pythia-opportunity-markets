/* eslint-disable @typescript-eslint/no-explicit-any */
import idl from '../target/idl/pythia_op.json';
import { pruneCallbackInstructions, specializeTypeParameterGenerics } from './idlTransform';

const hasGenericPlaceholders = (obj: any): boolean => {
	let found = false;
	const visit = (node: any) => {
		if (!node || typeof node !== 'object' || found) return;
		if (Object.prototype.hasOwnProperty.call(node, 'generic')) {
			found = true;
			return;
		}
		if (Array.isArray(node)) for (const v of node) visit(v);
		else for (const v of Object.values(node)) visit(v);
	};
	visit(obj);
	return found;
};

const log = (...args: any[]) => console.log('[test]', ...args);

const main = () => {
	const totalIxs = Array.isArray((idl as any).instructions)
		? (idl as any).instructions.length
		: 0;
	console.log(`[test] Original instructions: ${totalIxs}`);
	console.log(
		`[test] Original has generic placeholders: ${hasGenericPlaceholders((idl as any).types)}`,
	);

	const pruned = pruneCallbackInstructions(idl as any, log);
	const keptIxs = pruned.instructions?.length ?? 0;
	console.log(`[test] After prune: kept instructions: ${keptIxs}`);

	const transformed = specializeTypeParameterGenerics(pruned, log);
	console.log(
		`[test] After specialize: has generic placeholders: ${hasGenericPlaceholders(
			transformed.types,
		)}`,
	);

	// Print a small sample of type names for visibility
	const typeNames = (transformed.types ?? []).map((t: any) => t.name);
	console.log(`[test] Types count: ${typeNames.length}`);
	console.log(`[test] First 10 types: ${typeNames.slice(0, 10).join(', ')}`);
};

main();
