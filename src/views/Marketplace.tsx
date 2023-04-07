/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { Box, Heading, Spinner } from "@chakra-ui/react";
import { Information } from "web3uikit";
import { useMoralisQuery, useMoralis, useERC20Balances } from "react-moralis";
import NFTBox from "../components/NFTBox";
import { useEffect, useState } from "react";

export default function Marketplace() {
  const [balance, setBalance] = useState("loading...");

  const { isWeb3Enabled } = useMoralis();

  const {
    data: balanceData,
    isFetching: isFetchingBalance,
    error: balanceError,
  } = useERC20Balances({
    chain: "0xaa36a7",
  });

  const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
    "ActiveItem",
    (query) => query.limit(10).descending("tokenId"),
    [],
    {
      live: true,
    }
  );
  console.log(listedNfts);

  useEffect(() => {
    if (!isFetchingBalance && (balanceData || balanceError)) {
      if (balanceError) {
        setBalance("ERROR");
      } else if (balanceData) {
        console.log("balanceData", balanceData);
        const b = balanceData!.find(
          (x) => x.token_address === "0xce0a73066673628335b4ab8172b4b4282c4bde8d"
        )?.balance;
        if (b) {
          setBalance((parseInt(b, 10) / 100).toFixed(2));
        } else {
          setBalance("ERROR");
        }
      }
    }
  }, [isFetchingBalance, balanceData, balanceError]);

  return (
    <div className="container mx-auto">
      <Information topic="Current balance" information={`${balance} L3D`} />
      <Heading mb={4} mt={4}>
        Recently Listed
      </Heading>
      <div className="flex flex-wrap">
        {isWeb3Enabled ? (
          fetchingListedNfts ? (
            <Box>
              <Spinner thickness="4px" color="blue.300" size="xl" />
            </Box>
          ) : (
            listedNfts.map((nft) => {
              console.log(nft.attributes);
              const { price, nftAddress, tokenId, marketplaceAddress, seller } = nft.attributes;
              return (
                <NFTBox
                  price={price}
                  nftAddress={nftAddress}
                  tokenId={tokenId}
                  marketplaceAddress={marketplaceAddress}
                  seller={seller}
                  key={`${nftAddress}${tokenId}`}
                />
              );
            })
          )
        ) : (
          <div>Web3 Currently Not Enabled</div>
        )}
      </div>
    </div>
  );
}
