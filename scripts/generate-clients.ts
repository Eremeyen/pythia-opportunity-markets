import { createFromRoot } from 'codama';
import { rootNodeFromAnchor, AnchorIdl } from '@codama/nodes-from-anchor';
import { renderVisitor as renderJavaScriptVisitor } from '@codama/renderers-js';
import anchorIdl from '../target/idl/pythia_op.json';
import path from 'path';
import { pruneCallbackInstructions, specializeTypeParameterGenerics } from './idlTransform';

const log = (...args: any[]) => console.log('[gen]', ...args);

log('Starting IDL transforms...');
const pruned = pruneCallbackInstructions(anchorIdl, log);
const transformed = specializeTypeParameterGenerics(pruned, log);
log('Transforms complete.');

const codama = createFromRoot(rootNodeFromAnchor(transformed as AnchorIdl));

const jsClient = path.join(__dirname, '..', 'clients', 'js');
codama.accept(renderJavaScriptVisitor(path.join(jsClient, 'src', 'generated')));
