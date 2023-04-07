/* eslint-disable etc/no-commented-out-code */
/* eslint-disable no-console */
import { useState, useEffect } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { Image } from "@chakra-ui/react";
import { Card, useNotification } from "web3uikit";
import UpdateListingModal from "./UpdateListingModal";
import link3DollarAbi from "../constants/Link3Dollar.json";
import link3NftAbi from "../constants/Link3NFT.json";
import link3NftMarketplaceAbi from "../constants/Link3NFTMarketplace.json";
import networkMapping from "../constants/networkMapping.json";

const truncateStr = (fullStr, strLen) => {
  if (fullStr.length <= strLen) {
    return {
      fullStr,
    };
  }

  const separator = "...";
  const seperatorLength = separator.length;
  const charsToShow = strLen - seperatorLength;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return (
    fullStr.substring(0, frontChars) + separator + fullStr.substring(fullStr.length - backChars)
  );
};

export default function NFTBox({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
  const { isWeb3Enabled, account } = useMoralis();
  const [imageURI, setImageURI] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const hideModal = () => setShowModal(false);
  const dispatch = useNotification();

  const { runContractFunction: getTokenURI } = useWeb3Contract({
    abi: link3NftAbi,
    contractAddress: nftAddress,
    functionName: "tokenURI",
    params: {
      tokenId,
    },
  });

  const { runContractFunction } = useWeb3Contract();

  async function approveAndBuy() {
    console.log("Approving...");

    const approveOptions = {
      abi: link3DollarAbi,
      contractAddress: networkMapping["11155111"].Link3Dollar,
      functionName: "approve",
      params: {
        spender: networkMapping["11155111"].Link3NFTMarketplace,
        amount: price,
      },
    };

    await runContractFunction({
      params: approveOptions,
      onSuccess: () => handleApproveSuccess(price),
      onError: (error) => {
        dispatch({
          type: "error",
          title: "Failed to approve L3D",
          message: error.message || "",
          position: "topR",
        });
        console.log(error);
      },
    });
  }

  async function handleApproveSuccess() {
    console.log("Listing...");
    const buyOptions = {
      abi: link3NftMarketplaceAbi,
      contractAddress: networkMapping["11155111"].Link3NFTMarketplace,
      functionName: "listItem",
      params: {
        nftAddress,
        tokenId,
        price,
      },
    };

    await runContractFunction({
      params: buyOptions,
      onSuccess: handleBuyItemSuccess,
      onError: (error) => {
        dispatch({
          type: "error",
          title: "Failed to buy NFT",
          message: error.message || "",
          position: "topR",
        });
        console.log(error);
      },
    });
  }

  const handleBuyItemSuccess = async (tx) => {
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Sent NFT purchase request",
      title: "You can check the progress in the wallet",
      position: "topR",
    });
  };

  async function updateUI() {
    const tokenURI = await getTokenURI();
    console.log(`The TokenURI is ${tokenURI}`);
    if (tokenURI) {
      const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
      const tokenURIResponse = await (await fetch(requestURL)).json();
      const imageURIURL = tokenURIResponse.image.replace("ipfs://", "https://ipfs.io/ipfs/");
      setImageURI(imageURIURL);
      setTokenName(tokenURIResponse.name);
      setTokenDescription(tokenURIResponse.description);
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  const isOwnedByUser = seller === account || seller === undefined;
  const formattedSellerAddress = isOwnedByUser ? "you" : truncateStr(seller || "", 15);

  const handleCardClick = () => {
    if (isOwnedByUser) {
      setShowModal(true);
    } else {
      approveAndBuy();
    }
  };

  return (
    <div>
      <div>
        {imageURI ? (
          <div>
            <UpdateListingModal
              isVisible={showModal}
              tokenId={tokenId}
              marketplaceAddress={marketplaceAddress}
              nftAddress={nftAddress}
              onClose={hideModal}
            />
            <Card title={tokenName} description={tokenDescription} onClick={handleCardClick}>
              <div className="p-2">
                <div className="flex flex-col items-end gap-2">
                  <div>#{tokenId}</div>
                  <div className="italic text-sm">Owned by {formattedSellerAddress}</div>
                  <Image loader={() => imageURI} src={imageURI} height="200" width="200" />
                  <div className="font-bold">{(price / 100).toFixed(2)} L3D</div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}
