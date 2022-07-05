<script setup lang="ts">

import {onMounted, ref} from "vue"
import {useEthereum} from "../../composables/useEthereum";
import NFTCollection from "../NFTCollection/NFTCollection.vue";


// const CONTRACT_ADDRESS = "0x311970bA54385ae9bD68287843B974c6525d7c64";
// contract with count function:
const CONTRACT_ADDRESS = "0xeb5360650Ceba56CFFae797Bc41B86173afBaDD6";

const {
  currentAccount,
  currentChainId,
  isMinting,
  isMintDone,
  tokenId,
  totalMinted,
  // nftCollection,
  setupEventListener,
  checkIfWalletIsConnected,
  connectWallet,
  switchChain,
  askContractToMintNft
} = useEthereum(CONTRACT_ADDRESS)

// const isCollectionOpen = ref(false)

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

        <div v-if="currentAccount">
          <p class="sub-text" >Found an authorized account: {{ currentAccount }}</p>
          <p class="sub-text" >Current chain: {{ currentChainId }}</p>
          <p class="sub-text" v-if="currentChainId !== '0x4'">You are not connected to Rinkeby chain. <button class="cta-button connect-wallet-button" @click="switchChain">Switch to <b>Rinkeby</b></button></p>

          <button @click="askContractToMintNft" class="cta-button mint-button" :disabled="currentChainId !== '0x4'">
            Mint NFT
          </button>

          <p class="sub-text">Your total minted NFT's: {{ totalMinted }}. </p>
        <!--          <button class="cta-button mint-button" @click="isCollectionOpen = !isCollectionOpen">{{ isCollectionOpen ? 'Close' : 'Show'}} my NFT collection</button>-->
        <!--          <NFTCollection v-if="isCollectionOpen" :data="nftCollection" />-->

          <div v-if="isMintDone" class="badge badge--info">
            <p>Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the <a :href='`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId}`'>link</a></p>
          </div>

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
