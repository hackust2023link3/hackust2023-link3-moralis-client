/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./layout/Header";
import Main from "./layout/Main";
import Footer from "./layout/Footer";
import { VStack, Spacer, Alert, AlertIcon, AlertDescription, AlertTitle } from "@chakra-ui/react";
import { Nfts } from "./views/Nfts";
import Marketplace from "./views/Marketplace";

function App() {
  return (
    <VStack minHeight="100vh">
      <Header />
      <Alert status="info">
        <AlertIcon />
        <AlertTitle>Updates take time</AlertTitle>
        <AlertDescription>

          This demo uses <b>Sepolia Testnet</b>. The NFT status will be updated after{" "}
          <a
            href="https://docs.moralis.io/streams-api/evm/webhooks-transactions#two-webhooks-for-each-block"
            target="_blank"
          >
            <u>18 block confirmations</u>
          </a>
          .  Once your List Item / Update Listing / Cancel Listing / Buy Item request is successfully
          sent, please go to etherscan to check your transaction. After 18 blocks of confirmations,
          you can refresh and should see the NFT status / L3D balance is updated.
        </AlertDescription>
      </Alert>
      <Main>
        <Routes>
          <Route index element={<Marketplace />} />
          <Route path="nfts" element={<Nfts />} />
        </Routes>
      </Main>
      <Spacer />
      <Footer />
    </VStack>
  );
}

export default App;
