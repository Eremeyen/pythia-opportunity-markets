/**
 * Testnet bootstrap checklist:
 *
 * 1. Initialize every Arcium computation definition PDA on the target cluster.
 *    - Call `init_initialize_market_comp_def`.
 *    - Call `init_initialize_user_position_comp_def`.
 *    - Call `init_process_private_trade_comp_def`.
 *    - Call `init_update_user_position_comp_def`.
 *    - Call `init_close_position_comp_def`.
 *    - Call `init_reveal_market_state_comp_def`.
 *    - Call `init_reveal_user_position_comp_def`.
 *    - Call `init_hide_market_state_comp_def`.
 *    - Call `init_view_market_state_comp_def`.
 *    - Call `init_view_user_position_comp_def`.
 *
 * 2. Create and whitelist at least one sponsor.
 *    - Load the sponsor authority keypair (do NOT assume ~/.config/solana/id.json; accept a CLI path or key).
 *    - Run `init_sponsor` with that signer and a sponsor name.
 *    - Immediately run `whitelist_sponsor` so `init_market` will succeed.
 *
 * 3. Seed one or more markets so the UI/indexer has data.
 *    - Run `init_market` with the sponsor signer.
 *    - Run `init_market_encrypted` using a computation offset + MXE nonce (see `app/src/utils/arcium.ts` helpers).
 *    - Optionally queue `switch_to_public` / `switch_to_private` so both windows exist.
 *
 * 4. Indexer/backends must be aware of these actions.
 *    - After bootstrapping, inform the indexer (or rerun its backfill) so it ingests the sponsor PDA,
 *      market accounts, and emitted events. Without indexing, the app hooks will still see empty data.
 *
 * 5. Script expectations.
 *    - Accept RPC URL, wallet path/secret, sponsor metadata, and market metadata via CLI/env.
 *    - Use the generated client + transaction planner (`app/src/utils/transactionPlans.ts`) to submit txns.
 *    - Fail fast if any prerequisite (Arcium accounts, whitelist, indexer sync) is missing.
 */
