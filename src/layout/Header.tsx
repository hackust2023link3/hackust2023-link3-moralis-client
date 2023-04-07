/* eslint-disable etc/no-commented-out-code */
import React from "react";
import { Container, Spacer, HStack, Text, Flex } from "@chakra-ui/react";
import { Navigation } from "./Navigation";
import { ConnectButton } from "web3uikit";

const Header = () => {
  return (
    <Container maxW="container.lg" py={4}>
      <HStack>
        <Flex wrap="nowrap" alignItems={"start"} mr={4} direction="column">
          <Text fontSize={"xl"} fontWeight="800" color="#68738D">
            Link3 NFT Marketplace
          </Text>
        </Flex>
        <Navigation />
        <Spacer />
        <ConnectButton moralisAuth={false} />
      </HStack>
    </Container>
  );
};

export default Header;
