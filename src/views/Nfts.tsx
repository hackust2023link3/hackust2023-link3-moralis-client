/* eslint-disable etc/no-commented-out-code */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { VStack, Heading, Box } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { NftGrid } from "../components/NftGrid";
import { useMoralis } from "react-moralis";

const chain = "0xaa36a7";

export const Nfts = () => {
  const { account } = useMoralis();
  const [address, setAddress] = useState<string>(account || "");

  useEffect(() => {
    if (!address && account) {
      setAddress(account);
    }
  }, [account, address]);

  return (
    <VStack alignItems={"start"}>
      <Heading mb={4}>My NFTs</Heading>
      {address && (
        <Box pt={8}>
          <NftGrid address={address} chain={chain} />
        </Box>
      )}
    </VStack>
  );
};
