# Team \#2: Opportunity Markets

**Outline:** We will be taking heavy inspiration from [Opportunity Markets](https://www.paradigm.xyz/2025/08/opportunity-markets), and building a platform where domain experts, signal-finders, and scouts can share insights and place wagers on the success of early-stage startups seeking funding. The platform will also serve as a high-signal data source for venture capital firms and incubators, helping them conduct more informed due diligence and identify promising opportunities earlier. The idea is for analysts who generate accurate or valuable signals will be rewarded proportionally to their predictive performance and impact on successful investment outcomes.

Here is the high level overview of how this will all work:

1. A party will agree to sponsor a market, or multiple markets.  
   1. The market is of the form “Will we fund startup X within the next 6 months?”  
   2. By sponsoring the market, the sponsor supplies initial liquidity in the “NO” outcome and defines clear resolution criteria.   
   3. Markets are sponsored and initialized by sponsors, but signal providers may suggest new markets.  
2. Signal providers join the market to wager on the startup’s outcome and contribute new research  
   1. Signal providers would buy YES tokens and contribute their notes / research to the sponsor, who would be able to view it inside and outside the opportunity window.  
3. The sponsor can choose to or choose not to act on the outcome during the opportunity window, in which prices are hidden to everyone but the sponsor.  
4. When the outcome of the market is known, the sponsor resolves the market  
   1. If the market resolves to YES, signal providers are paid.  
   2. The market generates high signal data about which signal providers are insightful.

The market mechanism relies heavily on sponsors upholding their reputation and playing by the rules in version 0 of our product. Examples of who may sponsor these markets would be Alliance, OrangeDAO, A16z CSx etc.

**Motivation & Goals:** Oftentimes people find themselves in situations where they have unique knowledge in a situation, but they don’t have a way to price this knowledge. Enabling people to price in their convictions is a primary motivation of prediction markets. In this case, we want to tap into the common situation where we may have knowledge on an individual’s likelihood of success, and we have parties that may be interested in sponsoring the discovery of this information. People often brag about being early on a tiktok trend, or “investing”[^1] as an artist. Even though our v0 focuses on early stage startups, this market design and our learnings can be transferable to many domains where we could [own the vertical.](https://x.com/eightyhi/status/1977079491924283731) Some verticals may be: tiktok and internet trends, artists and online creators, research papers & r\&d.

Memecoin degenerates were going crazy over the *“Internet Capital Markets”* meta in Summer. The meta works like the following:

1. A “startup founder” launches a [Believe](https://believe.app/) token for their startup  
2. This token represents anything the startup founder wants it to represent, but isn’t at all legally binding, and is certainly not a security. The startup founder provides updates to their community and the token’s price loosely follows the quality of the founder’s updates  
3. The startup founder makes money from trading fees.

It’s clear that degenerates are interested in speculating in early stage companies. Surprisingly some companies that arose from this trend have had some decent traction. It’s worth noting that it’s unclear what modality is right for ICM, as the crypto community, for example, expected [ventuals](https://testnet.ventuals.com/) to be a dramatic success, but so far it has struggled for traction. **TLDR:** there is demand for degenerate early stage investing, and existing platforms either don’t make sense or have been unsuccessful.

Here are things we will be introduced to through this project:

1. Development on the Solana blockchain  
2. UI/UX and tools surrounding crypto apps.  
3. Designing provably fair systems[^2]  
4. Designing novel market mechanisms  
5. Being introduced to the Colosseum and Solana community (hopefully with a W)  
6. Develop intuition for how to extend PMs to many domains

**Challenges:**

1. **Traders have to operate blind:** Traders can’t see their fills, the market price, or anything concrete during the opportunity window. This has advantages, as it reduces herding and may make it easier for surprising contrarian views to arise, but it also brings about significant challenges where the trader doesn’t exactly know their opportunity size. To address this, we can provide small hints about how much attention the market is receiving.  
2. **Exploitation by sponsors**: untrustworthy sponsors could exploit markets. For example they could signal they will take an opportunity but bid on the NO side of it. For now we will assume the sponsors are reputable and also restrict a lot of the actions they can take.

**Design Choices:**

1. **Unlimited vs First N** **Outcomes**: *“For most types of opportunities, like artist signings, there is only a limited number that the sponsor can act on in a given time period. Accordingly, if traders are willing to trust the label to pay out, they can simply promise to pay out on an unlimited number of markets for “Will we sign Artist X in 2025?” and ensure they are never providing so much liquidity across all markets that they won’t be able to pay out if they sign too many artists. For a more permissionless approach, markets can be fully collateralized using a “First N” structure. For example, markets of the form “Will XYZ be among the first 10 artists we sign in 2025?” would require collateralizing each market with 10x the max liquidity since only 10 of them can pay off.”*  
2. **Bonding curve(?) design:** can we use bonding curves to use as a first-pass attention and due diligence filtering mechanism? Can this be a way in which we decide which companies are listed?  
3. **Liquidity & AMM / Order Book Design:** where should liquidity be concentrated? Should we use an AMM or order book design? How can we solve the liquidity bootstrap problem?  
4. **What happens after the opportunity window closes?** *“After the window closes, there are various design choices: reveal all prices and positions, reveal only positions to individual traders, have different rules for large versus small orders, etc. More sophisticated systems might allow sell-to-close or buy-to-close limit orders before positions are revealed, or even allow trading agents that operate without revealing current positions.”* 

**Technical Components & Steps:**  
Client:

1. Interface for traders to submit their findings and place trades.  
2. Interface for sponsors to view the state of the market, take actions on the opportunity, and resolve the markets  
3. Interface for bonding curves / people suggesting new markets

Onchain program / Smart contract:

1. Our onchain program will facilitate trades and hold all assets until the market is resolved.  
   1. [Confidential Transfer | Solana](https://solana.com/docs/tokens/extensions/confidential-transfer)  
   2. [Confidential Transfers on Solana: A Developer's Guide](https://www.quicknode.com/guides/solana-development/spl-tokens/token-2022/confidential)  
2. Trades will be private but the timestamp of the transfers cannot be hidden. Our indexer will query this information.

Backend & Indexer

1. Our backend will receive all requests for trades, aggregate the information, and forward it to the sponsor so that they may view the state of the market[^3]  
2. Our indexer will monitor the amount of trades in each market and the state of each market. Our client will query this information.

**Notes**  
The idea comes from Dave White, who is famous for designing novel markets. He works at a leading [crypto VC firm](https://www.paradigm.xyz/), who recently led Kalshi’s Series B and C. Dave White’s ideas are known for being creative but a little bit unrealistic in practice. Keep that in mind while mitigating the flaws of his design. Dave White briefly got really famous in 2021 for [Art Gobblers](https://www.paradigm.xyz/2022/09/artgobblers), which was the highest priced NFT collection ever. Unfortunately it came out that the artist of the collection previously made pedophilic work. This got quickly forgotten because shortly after that the [FTX situation](https://en.wikipedia.org/wiki/Bankruptcy_of_FTX) unfolded.

We aim to submit this project to Colleseum’s Cypherpunk hackathon. Colosseum spun out of the hackathon’s Solana Foundation used to host. Hackathons in crypto used to have the problem of builders recycling code and ideas where most ideas don’t materialize into anything. Colosseum addresses this by being a hybrid hackathon \+ incubator. Colosseum is heavily focused on Solana. Colosseum invests 250k in winners of their hackathons.They always have college tracks. Last year UT Austin won one of their college tracks. Their project was lowkey boring. 

**Resources**  
[Opportunity Markets](https://www.paradigm.xyz/2025/08/opportunity-markets)  
[https://www.bitget.com/news/detail/12560604919364](https://www.bitget.com/news/detail/12560604919364?utm_source=chatgpt.com)

Julian’s notes, dont be mad at me eren:)

For team \#2 opportunity markets

[https://www.kickstarter.com/](https://www.kickstarter.com/)

Im thinking about kickstarter we can grab inspiration from their UI but not everything cause lowkey that shit looks like temu

The thing is that these things would probably get settle after a good while as startups take time to come to fruition but I guess the question would be what is the time frame for these “startup polymarkets”

Resources for inspiration:

[https://www.shopify.com/blog/crowdfunding-sites](https://www.shopify.com/blog/crowdfunding-sites)

[https://thecrowdspace.com/platforms/](https://thecrowdspace.com/platforms/)

For the privacy stuff which i dont understand very well for team 2 we could do like vague description of the startups/opportuinities and idk

[^1]:  Credit to Abhinav for bringing this to my attention

[^2]:  Markets staying anonymous and being provable fair using cryptographic methods is central to the original [Cypherpunk](https://en.wikipedia.org/wiki/Cypherpunk) Bitcoin vision.

[^3]:  This isn’t ideal, but it should suffice for a v0 we submit to a hackathon.