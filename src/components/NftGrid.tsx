/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable etc/no-commented-out-code */
/* eslint-disable no-console */
// @ts-nocheck
import {
  Text,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Spinner,
  GridItem,
  Heading,
  Image,
  Wrap,
  Tag,
  Button,
  SimpleGrid,
  VStack,
  StackDivider,
} from "@chakra-ui/react";
import React, { useMemo } from "react";
import { useNotification } from "web3uikit";
import { useNFTBalances, useWeb3Contract, useMoralisQuery, useMoralis } from "react-moralis";
import link3NftAbi from "../constants/Link3NFT.json";
import link3NftMarketplaceAbi from "../constants/Link3NFTMarketplace.json";
import networkMapping from "../constants/networkMapping.json";

interface NftProps {
  name: string;
  description: string;
  metadata?: { image?: string };
  address: string;
  id: string;
  type: string;
  isListed: boolean;
  isCardButtonReady: boolean;
}
const Nft = ({
  name,
  address,
  description,
  id,
  metadata,
  type,
  isListed,
  isCardButtonReady,
}: NftProps) => {
  const dispatch = useNotification();

  const { runContractFunction, isLoading, isFetching } = useWeb3Contract();

  async function approveAndList() {
    console.log("Approving...");
    const price = 290;

    const approveOptions = {
      abi: link3NftAbi,
      contractAddress: networkMapping["11155111"].Link3NFT,
      functionName: "approve",
      params: {
        to: networkMapping["11155111"].Link3NFTMarketplace,
        tokenId: id,
      },
    };

    await runContractFunction({
      params: approveOptions,
      onSuccess: () => handleApproveSuccess(price),
      onError: (error) => {
        dispatch({
          type: "error",
          title: "Failed to approve NFT",
          message: error.message || "",
          position: "topR",
        });
        console.log(error);
      },
    });
  }

  async function handleApproveSuccess(price) {
    console.log("Listing...");
    const listOptions = {
      abi: link3NftMarketplaceAbi,
      contractAddress: networkMapping["11155111"].Link3NFTMarketplace,
      functionName: "listItem",
      params: {
        nftAddress: address,
        tokenId: id,
        price,
      },
    };

    await runContractFunction({
      params: listOptions,
      onSuccess: handleListSuccess,
      onError: (error) => {
        dispatch({
          type: "error",
          title: "Failed to list NFT",
          message: error.message || "",
          position: "topR",
        });
        console.log(error);
      },
    });
  }

  async function handleListSuccess(tx) {
    await tx.wait(1);
    dispatch({
      type: "success",
      title: "Sent NFT listing request",
      message: "You can check the progress in the wallet",
      position: "topR",
    });
  }

  async function cancelListing() {
    const options = {
      abi: link3NftMarketplaceAbi,
      contractAddress: networkMapping["11155111"].Link3NFTMarketplace,
      functionName: "cancelListing",
      params: {
        nftAddress: address,
        tokenId: id,
      },
    };

    await runContractFunction({
      params: options,
      onSuccess: () => {
        dispatch({
          type: "success",
          title: "Sent NFT listing cancellation request",
          message: "You can check the progress in the wallet",
          position: "topR",
        });
      },
      onError: (error) => {
        dispatch({
          type: "error",
          title: "Failed to cancel NFT listing",
          message: error.message || "",
          position: "topR",
        });
        console.log(error);
      },
    });
  }

  function handleCardClick() {
    if (isListed) {
      cancelListing();
    } else {
      approveAndList();
    }
  }

  const buttonText = useMemo(() => (isListed ? "Cancel listing" : "List"), [isListed]);
  const buttonVariant = useMemo(() => (isListed ? "outline" : "solid"), [isListed]);

  return (
    <Box backgroundColor="gray.100" borderRadius="8px" overflow="hidden">
      <Box p={4}>
        {metadata?.image && (
          <Image src={metadata.image.replace("ipfs://", "https://ipfs.moralis.io:2053/ipfs/")} />
        )}
        <Heading fontSize={"md"}>
          {metadata?.name || metadata?.title || name} #{id}
        </Heading>

        <Wrap my={2}>
          <Tag colorScheme={"blue"}>Type {type}</Tag>
          <Tag colorScheme={"blue"}>{name}</Tag>
        </Wrap>

        <VStack divider={<StackDivider borderColor="gray.200" />} spacing={4} align="stretch">
          <div>
            <Text fontSize={"sm"}>Address: {address}</Text>
            {description && <Text fontSize={"sm"}>{description}</Text>}
          </div>

          {isCardButtonReady && (
            <Button
              variant={buttonVariant}
              colorScheme="blue"
              onClick={handleCardClick}
              disabled={isLoading || isFetching}
            >
              {buttonText}
            </Button>
          )}
        </VStack>
      </Box>
    </Box>
  );
};
interface NftGridProps {
  address: string;
  chain: string;
}

export const NftGrid = ({ address, chain }: NftGridProps) => {
  const { isWeb3Enabled } = useMoralis();

  const { data, error, isLoading } = useNFTBalances(
    {
      //@ts-ignore
      chain,
      address,
    },
    {
      autoFetch: true,
    }
  );

  const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
    "ActiveItem",
    (query) =>
      query
        .containedIn(
          "tokenId",
          data?.result?.map((y) => y.token_id)
        )
        .limit(1000)
        .descending("tokenId"),
    [data],
    { live: true }
  );
  console.log(listedNfts);

  if (!isWeb3Enabled) {
    <div>Web3 Currently Not Enabled</div>;
  }

  if (isLoading) {
    return (
      <Box>
        <Spinner thickness="4px" color="blue.300" size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>{error.name}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  if (!data?.result || data.result.length === 0) {
    return <Box>No results</Box>;
  }

  return (
    <SimpleGrid minChildWidth="150px" spacing="20px">
      {data.result.map((nft) => (
        <GridItem key={`${nft.token_address}${nft.token_id}`}>
          <Nft
            name={nft.name}
            id={nft.token_id}
            address={nft.token_address}
            metadata={nft.metadata}
            type={nft.contract_type}
            isListed={listedNfts.find((x) => x.attributes.tokenId === nft.token_id)}
            isCardButtonReady={!fetchingListedNfts}
          />
        </GridItem>
      ))}
    </SimpleGrid>
  );
};
