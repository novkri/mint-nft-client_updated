<script setup lang="ts">
import { ethers } from "ethers"
import {onMounted, ref} from "vue"
import {useEthereum} from "../../composables/useEthereum";


const CONTRACT_ADDRESS = "0x311970bA54385ae9bD68287843B974c6525d7c64";

const { currentAccount, currentChainId, isMinting, isMintDone, tokenId,
  setupEventListener,
  checkIfWalletIsConnected,
  connectWallet,
  switchChain } = useEthereum(CONTRACT_ADDRESS)



onMounted(() => {
  setupEventListener()
  checkIfWalletIsConnected()
})
</script>

<template>
    <div class="container">
      <div class="header-container">
        <p class="header gradient-text">My NFT Collection</p>
        <p class="sub-text">
          Each unique. Each beautiful. Discover your NFT today.
        </p>
        <button v-if="!currentAccount" class="cta-button connect-wallet-button" @click="connectWallet">Connect to Wallet</button>
        <!--        todo text & styles -->
        <p class="sub-text" v-if="currentAccount">Found an authorized account: {{ currentAccount }}</p>
        <p class="sub-text" v-if="currentAccount">Current chain: {{ currentChainId }}</p>
        <p class="sub-text" v-if="currentAccount && currentChainId !== '0x4'">You are not connected to Rinkeby chain. <button class="cta-button connect-wallet-button" @click="switchChain">Switch to <b>Rinkeby</b></button></p>

        <button v-if="currentAccount" @click="askContractToMintNft" class="cta-button mint-button" :disabled="currentChainId !== '0x4'">
          Mint NFT
        </button>

        <!--        todo jumping -->
        <div v-if="isMintDone" class="badge badge--info">
          <p>Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the   <a :href='`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId}`'>link</a></p>
        </div>


      </div>

      <div class="loader" v-if="isMinting" />
      <p class="sub-text" v-if="isMinting">Minting... Please wait</p>
      <div class="footer-container">

      </div>
    </div>

</template>

<style scoped>
@import "home.css";
</style>
