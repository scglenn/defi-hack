import React, { Component, useEffect } from "react";
import { useState } from "react";

import DEFIHACK_ABI from "./defiHack.json";

import { BigNumber, ethers } from "ethers";

interface State {
  selectedAddress: string;
  balance: string;
  contractCount: string;
  disputerCount: string;
}

interface ContractData {
  has_been_added: boolean;
  contract_dispute_pending: boolean;
  contract_hacked: boolean;
}

interface DisputerData {
  has_been_added: boolean;
  stake: BigNumber;
  is_disputing: boolean;
}

interface RewardData {
  stake: BigNumber;
}

const Metamask = () => {
  const [state, setState] = useState<State>();
  const [block, setBlock] = useState<number>();

  useEffect(() => {
    if (!state) {
      console.log("reset");
      setState({
        selectedAddress: "",
        balance: "",
        contractCount: "",
        disputerCount: "",
      });
    }
  }, []);

  function getState() {
    return state;
  }

  async function connectToMetamask() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const balance = await provider.getBalance(accounts[0]);
    const balanceInEther = ethers.utils.formatEther(balance);

    provider.on("block", (block) => {
      setBlock(block);
      //console.log(state);
    });

    const hackContract = new ethers.Contract(
      "0x95fe6cdf29ea844175be87d6edcc6371a1ce20a6",
      DEFIHACK_ABI,
      provider
    );
    const contractCount: BigNumber = await hackContract.contract_count();
    const disputerCount: BigNumber = await hackContract.disputer_count();

    // loop through all contracts
    for (let i = 0; i < contractCount.toNumber(); i++) {
      const contractAddress = await hackContract.contract_list(i);
      const contract: ContractData = await hackContract.contract_data(
        contractAddress
      );
      console.log(contract);
    }

    setState({
      selectedAddress: accounts[0],
      balance: balanceInEther,
      contractCount: contractCount.toString(),
      disputerCount: disputerCount.toString(),
    });
  }

  async function sendDaiTo() {
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = provider.getSigner();
    // const daiContract = new ethers.Contract(
    //   "0x6b175474e89094c44da98b954eedeac495271d0f",
    //   ERC20_ABI,
    //   provider
    // );
    // const tokenUnits = await daiContract.decimals();
    // const tokenAmountInEther = ethers.utils.parseUnits(
    //   amountInEther,
    //   tokenUnits
    // );
    // const daiContractWithSigner = daiContract.connect(signer);
    // daiContractWithSigner.transfer(
    //   "0x708Ef16bF16Bb9f14CfE36075E9ae17bCd1C5B40",
    //   tokenAmountInEther
    // );
  }

  async function reportHack() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const hackContract = new ethers.Contract(
      "0x95fe6cdf29ea844175be87d6edcc6371a1ce20a6",
      DEFIHACK_ABI,
      provider
    );
    const hackContractWithSigner = hackContract.connect(signer);
    const options = { value: ethers.utils.parseEther("0.001") };
    const tx = await hackContractWithSigner.hackDispute(
      "0x708Ef16bF16Bb9f14CfE36075E9ae17bCd1C5B40",
      options
    );

    console.log(tx.hash);

    await tx.wait();
  }

  function renderMetamask() {
    if (!state?.selectedAddress) {
      return (
        <button onClick={() => connectToMetamask()}>Connect to Metamask</button>
      );
    } else {
      return (
        <div>
          <p>Welcome {state?.selectedAddress}</p>
          <p>Your ETH Balance is: {state?.balance}</p>
          <p>Current ETH Block is: {block}</p>
          <p>Contract Count: {state?.contractCount}</p>
          <p>Disputer Count: {state?.disputerCount}</p>
          <button onClick={() => sendDaiTo()}>Donate 1 DAI</button>
        </div>
      );
    }
  }

  return <div>{renderMetamask()}</div>;
};

export default Metamask;
