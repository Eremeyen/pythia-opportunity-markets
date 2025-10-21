"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var anchor = require("@coral-xyz/anchor");
var web3_js_1 = require("@solana/web3.js");
var crypto_1 = require("crypto");
var client_1 = require("@arcium-hq/client");
var fs = require("fs");
var os = require("os");
describe("PythiaOp", function () {
    var CLUSTER_OFFSET = 1078779259;
    // Use the environment-provided provider so `arcium test` localnet works,
    // and devnet works when invoked with `--skip-local-validator --provider.cluster devnet`.
    var provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    var program = anchor.workspace.PythiaOp;
    var awaitEvent = function (eventName) { return __awaiter(void 0, void 0, void 0, function () {
        var listenerId, event;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (res) {
                        listenerId = program.addEventListener(eventName, function (event) {
                            res(event);
                        });
                    })];
                case 1:
                    event = _a.sent();
                    return [4 /*yield*/, program.removeEventListener(listenerId)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, event];
            }
        });
    }); };
    var clusterAccount = (0, client_1.getClusterAccAddress)(CLUSTER_OFFSET);
    it("Full market lifecycle test", function () { return __awaiter(void 0, void 0, void 0, function () {
        var owner, requiredCircuits, _i, requiredCircuits_1, circuit, mxePublicKey, question, marketSeeds, marketPDA, collateralMint, yesMint, noMint, vault, initMarketSig, initComputationOffset, initMarketEncSig, traderPrivateKey, traderPublicKey, sharedSecret, cipher, traderId, dollarAmount, isBuyYes, infoHash, tradeData, tradeNonce, tradeCiphertext, tradeEventPromise, tradeComputationOffset, ciphertextBigints, flatCiphertext, tradeSig, tradeEvent, revealEventPromise, revealComputationOffset, switchPublicSig, revealEvent, publicTradeEventPromise, publicTradeSig, publicTradeEvent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    owner = readKpJson("".concat(os.homedir(), "/.config/solana/id.json"));
                    console.log("Initializing computation definitions...");
                    requiredCircuits = [
                        "initialize_market",
                        "initialize_user_position",
                        "process_private_trade",
                        "update_user_position",
                        "reveal_market_state",
                        "hide_market_state",
                        "view_market_state",
                        "view_user_position",
                    ];
                    _i = 0, requiredCircuits_1 = requiredCircuits;
                    _a.label = 1;
                case 1:
                    if (!(_i < requiredCircuits_1.length)) return [3 /*break*/, 4];
                    circuit = requiredCircuits_1[_i];
                    return [4 /*yield*/, initCompDef(program, owner, circuit)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log("All computation definitions initialized");
                    return [4 /*yield*/, getMXEPublicKeyWithRetry(provider, program.programId)];
                case 5:
                    mxePublicKey = _a.sent();
                    console.log("MXE x25519 pubkey is", Buffer.from(mxePublicKey).toString("hex"));
                    question = "Will ETH reach $5000 by EOY?";
                    marketSeeds = [
                        Buffer.from("market"),
                        owner.publicKey.toBuffer(),
                        Buffer.from(question),
                    ];
                    marketPDA = web3_js_1.PublicKey.findProgramAddressSync(marketSeeds, program.programId)[0];
                    console.log("Creating market...");
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("@solana/spl-token"); }).then(function (spl) {
                            return spl.createMint(provider.connection, owner, owner.publicKey, null, 6);
                        })];
                case 6:
                    collateralMint = _a.sent();
                    yesMint = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("yes_mint"), marketPDA.toBuffer()], program.programId)[0];
                    noMint = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("no_mint"), marketPDA.toBuffer()], program.programId)[0];
                    vault = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault"), marketPDA.toBuffer()], program.programId)[0];
                    return [4 /*yield*/, program.methods
                            .initMarket(question, new anchor.BN(Date.now() / 1000 + 86400 * 30), // 30 days from now
                        new anchor.BN(1000000), // liquidity cap
                        new anchor.BN(10000), // liquidity param (b) - NEW
                        new anchor.BN(300), // 5 min opportunity window
                        new anchor.BN(300) // 5 min public window
                        )
                            .accountsPartial({
                            sponsor: owner.publicKey,
                            market: marketPDA,
                            yesMint: yesMint,
                            noMint: noMint,
                            collateralMint: collateralMint,
                            vault: vault
                        })
                            .signers([owner])
                            .rpc({ commitment: "confirmed" })];
                case 7:
                    initMarketSig = _a.sent();
                    console.log("Market created:", initMarketSig);
                    // Initialize encrypted market state
                    console.log("Initializing encrypted market state...");
                    initComputationOffset = new anchor.BN((0, crypto_1.randomBytes)(8), "hex");
                    return [4 /*yield*/, program.methods
                            .initMarketEncrypted(initComputationOffset, new anchor.BN(10000), // initial yes pool
                        new anchor.BN(10000) // initial no pool
                        )
                            .accountsPartial({
                            payer: owner.publicKey,
                            market: marketPDA,
                            computationAccount: (0, client_1.getComputationAccAddress)(program.programId, initComputationOffset),
                            clusterAccount: clusterAccount,
                            mxeAccount: (0, client_1.getMXEAccAddress)(program.programId),
                            mempoolAccount: (0, client_1.getMempoolAccAddress)(program.programId),
                            executingPool: (0, client_1.getExecutingPoolAccAddress)(program.programId),
                            compDefAccount: (0, client_1.getCompDefAccAddress)(program.programId, Buffer.from((0, client_1.getCompDefAccOffset)("initialize_market")).readUInt32LE())
                        })
                            .signers([owner])
                            .rpc({ skipPreflight: true, commitment: "confirmed" })];
                case 8:
                    initMarketEncSig = _a.sent();
                    console.log("Init market encrypted queued:", initMarketEncSig);
                    return [4 /*yield*/, (0, client_1.awaitComputationFinalization)(provider, initComputationOffset, program.programId, "confirmed")];
                case 9:
                    _a.sent();
                    console.log("Market state initialized");
                    // Test private trade
                    console.log("\n--- Testing private trade ---");
                    traderPrivateKey = client_1.x25519.utils.randomSecretKey();
                    traderPublicKey = client_1.x25519.getPublicKey(traderPrivateKey);
                    sharedSecret = client_1.x25519.getSharedSecret(traderPrivateKey, mxePublicKey);
                    cipher = new client_1.RescueCipher(sharedSecret);
                    traderId = BigInt(12345);
                    dollarAmount = BigInt(1000);
                    isBuyYes = BigInt(1);
                    infoHash = Array.from({ length: 32 }, function (_, i) { return BigInt(i); });
                    tradeData = __spreadArray([traderId, dollarAmount, isBuyYes], infoHash, true);
                    tradeNonce = (0, crypto_1.randomBytes)(16);
                    tradeCiphertext = cipher.encrypt(tradeData, tradeNonce);
                    tradeEventPromise = awaitEvent("tradeEvent");
                    tradeComputationOffset = new anchor.BN((0, crypto_1.randomBytes)(8), "hex");
                    ciphertextBigints = tradeCiphertext;
                    flatCiphertext = new Uint8Array(ciphertextBigints.length * 32);
                    ciphertextBigints.forEach(function (chunk, i) {
                        var chunkBytes = (0, client_1.serializeLE)(chunk, 32);
                        flatCiphertext.set(chunkBytes, i * 32);
                    });
                    return [4 /*yield*/, program.methods
                            .tradePrivate(tradeComputationOffset, Buffer.from(flatCiphertext), Array.from(traderPublicKey), new anchor.BN((0, client_1.deserializeLE)(tradeNonce).toString()))
                            .accountsPartial({
                            payer: owner.publicKey,
                            market: marketPDA,
                            computationAccount: (0, client_1.getComputationAccAddress)(program.programId, tradeComputationOffset),
                            clusterAccount: clusterAccount,
                            mxeAccount: (0, client_1.getMXEAccAddress)(program.programId),
                            mempoolAccount: (0, client_1.getMempoolAccAddress)(program.programId),
                            executingPool: (0, client_1.getExecutingPoolAccAddress)(program.programId),
                            compDefAccount: (0, client_1.getCompDefAccAddress)(program.programId, Buffer.from((0, client_1.getCompDefAccOffset)("process_private_trade")).readUInt32LE())
                        })
                            .signers([owner])
                            .rpc({ skipPreflight: true, commitment: "confirmed" })];
                case 10:
                    tradeSig = _a.sent();
                    console.log("Private trade queued:", tradeSig);
                    return [4 /*yield*/, (0, client_1.awaitComputationFinalization)(provider, tradeComputationOffset, program.programId, "confirmed")];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, tradeEventPromise];
                case 12:
                    tradeEvent = _a.sent();
                    console.log("Trade processed, window:", tradeEvent.window);
                    // Switch to public window
                    console.log("\n--- Switching to public window ---");
                    // Wait for opportunity window to expire
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                case 13:
                    // Wait for opportunity window to expire
                    _a.sent();
                    revealEventPromise = awaitEvent("windowSwitchEvent");
                    revealComputationOffset = new anchor.BN((0, crypto_1.randomBytes)(8), "hex");
                    return [4 /*yield*/, program.methods
                            .switchToPublic(revealComputationOffset)
                            .accountsPartial({
                            payer: owner.publicKey,
                            market: marketPDA,
                            computationAccount: (0, client_1.getComputationAccAddress)(program.programId, revealComputationOffset),
                            clusterAccount: clusterAccount,
                            mxeAccount: (0, client_1.getMXEAccAddress)(program.programId),
                            mempoolAccount: (0, client_1.getMempoolAccAddress)(program.programId),
                            executingPool: (0, client_1.getExecutingPoolAccAddress)(program.programId),
                            compDefAccount: (0, client_1.getCompDefAccAddress)(program.programId, Buffer.from((0, client_1.getCompDefAccOffset)("reveal_market_state")).readUInt32LE())
                        })
                            .signers([owner])
                            .rpc({ skipPreflight: true, commitment: "confirmed" })];
                case 14:
                    switchPublicSig = _a.sent();
                    console.log("Switch to public queued:", switchPublicSig);
                    return [4 /*yield*/, (0, client_1.awaitComputationFinalization)(provider, revealComputationOffset, program.programId, "confirmed")];
                case 15:
                    _a.sent();
                    return [4 /*yield*/, revealEventPromise];
                case 16:
                    revealEvent = _a.sent();
                    console.log("Switched to public:", revealEvent);
                    console.log("Yes pool:", revealEvent.yesPool.toString());
                    console.log("No pool:", revealEvent.noPool.toString());
                    // Test public trade
                    console.log("\n--- Testing public trade ---");
                    publicTradeEventPromise = awaitEvent("tradeEvent");
                    return [4 /*yield*/, program.methods
                            .tradePublic(new anchor.BN(500), true)
                            .accounts({
                            trader: owner.publicKey,
                            market: marketPDA
                        })
                            .signers([owner])
                            .rpc({ commitment: "confirmed" })];
                case 17:
                    publicTradeSig = _a.sent();
                    console.log("Public trade executed:", publicTradeSig);
                    return [4 /*yield*/, publicTradeEventPromise];
                case 18:
                    publicTradeEvent = _a.sent();
                    console.log("Public trade event:", publicTradeEvent.window);
                    console.log("\n✅ All tests passed!");
                    return [2 /*return*/];
            }
        });
    }); });
    function initCompDef(program, owner, circuitName) {
        return __awaiter(this, void 0, void 0, function () {
            var baseSeedCompDefAcc, offset, compDefPDA, methodName, sig, finalizeTx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        baseSeedCompDefAcc = (0, client_1.getArciumAccountBaseSeed)("ComputationDefinitionAccount");
                        offset = (0, client_1.getCompDefAccOffset)(circuitName);
                        compDefPDA = web3_js_1.PublicKey.findProgramAddressSync([baseSeedCompDefAcc, program.programId.toBuffer(), offset], (0, client_1.getArciumProgAddress)())[0];
                        console.log("  Initializing ".concat(circuitName, " comp def at ").concat(compDefPDA));
                        methodName = "init".concat(circuitName
                            .split("_")
                            .map(function (s) { return s.charAt(0).toUpperCase() + s.slice(1); })
                            .join(""), "CompDef");
                        return [4 /*yield*/, program.methods[methodName]()
                                .accounts({
                                compDefAccount: compDefPDA,
                                payer: owner.publicKey,
                                mxeAccount: (0, client_1.getMXEAccAddress)(program.programId)
                            })
                                .signers([owner])
                                .rpc({
                                commitment: "confirmed"
                            })];
                    case 1:
                        sig = _a.sent();
                        return [4 /*yield*/, (0, client_1.buildFinalizeCompDefTx)(provider, Buffer.from(offset).readUInt32LE(), program.programId)];
                    case 2:
                        finalizeTx = _a.sent();
                        finalizeTx.feePayer = owner.publicKey;
                        return [4 /*yield*/, provider.sendAndConfirm(finalizeTx, [owner], {
                                commitment: "confirmed"
                            })];
                    case 3:
                        _a.sent();
                        console.log("  \u2713 ".concat(circuitName, " initialized"));
                        return [2 /*return*/, sig];
                }
            });
        });
    }
});
function getMXEPublicKeyWithRetry(provider, programId, maxRetries, retryDelayMs) {
    if (maxRetries === void 0) { maxRetries = 10; }
    if (retryDelayMs === void 0) { retryDelayMs = 500; }
    return __awaiter(this, void 0, void 0, function () {
        var attempt, mxePublicKey, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    attempt = 1;
                    _a.label = 1;
                case 1:
                    if (!(attempt <= maxRetries)) return [3 /*break*/, 8];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, client_1.getMXEPublicKey)(provider, programId)];
                case 3:
                    mxePublicKey = _a.sent();
                    if (mxePublicKey) {
                        return [2 /*return*/, mxePublicKey];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.log("Attempt ".concat(attempt, " failed to fetch MXE public key:"), error_1);
                    return [3 /*break*/, 5];
                case 5:
                    if (!(attempt < maxRetries)) return [3 /*break*/, 7];
                    console.log("Retrying in ".concat(retryDelayMs, "ms... (attempt ").concat(attempt, "/").concat(maxRetries, ")"));
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, retryDelayMs); })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    attempt++;
                    return [3 /*break*/, 1];
                case 8: throw new Error("Failed to fetch MXE public key after ".concat(maxRetries, " attempts"));
            }
        });
    });
}
function readKpJson(path) {
    var file = fs.readFileSync(path);
    return anchor.web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(file.toString())));
}
