<script setup lang="ts">

import {onMounted, ref} from "vue"
import {useEthereum} from "../../composables/useEthereum";
import NFTCollection from "../NFTCollection/NFTCollection.vue";


// const CONTRACT_ADDRESS = "0x311970bA54385ae9bD68287843B974c6525d7c64";
// contract with count function:
// const CONTRACT_ADDRESS = "0xeb5360650Ceba56CFFae797Bc41B86173afBaDD6";
// contract with mint limit
const CONTRACT_ADDRESS = "0x8268C6fD36A68Dd9a8711CaF561f2C4372B29cD5";

const {
  currentAccount,
  currentChainId,
  isMinting,
  isMintDone,
  tokenId,
  totalMinted,
  total,
  // nftCollection,
  setupEventListener,
  checkIfWalletIsConnected,
  connectWallet,
  switchChain,
  askContractToMintNft
} = useEthereum(CONTRACT_ADDRESS)

onMounted(() => {
  setupEventListener()
  checkIfWalletIsConnected()
})

enum popularChains {
  '0x1' = 'Ethereum Main Network (Mainnet)',
  '0x3' = 'Ropsten Test Network',
  '0x4' = 'Rinkeby Test Network',
  '0x5' = 'Goerli Test Network',
  '0x2a' = 'Kovan Test Network',
}
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
          <br />
          <p class="sub-text" >Found an authorized account: {{ currentAccount }}</p>
          <p class="sub-text" >Current chain: {{ popularChains[currentChainId] }}</p>
          <p class="sub-text" v-if="currentChainId !== '0x4'">You are not connected to Rinkeby chain. <button class="cta-button connect-wallet-button" @click="switchChain">Switch to <b>Rinkeby</b></button></p>

          <br />
          <button @click="askContractToMintNft" class="cta-button mint-button" :disabled="currentChainId !== '0x4'">
            Mint NFT
          </button>

          <br />
          <p class="sub-text">Your total minted NFT's: {{ totalMinted }}/{{total}}. </p>
          <!--          <button class="cta-button mint-button" @click="isCollectionOpen = !isCollectionOpen">{{ isCollectionOpen ? 'Close' : 'Show'}} my NFT collection</button>-->
          <!--          <NFTCollection v-if="isCollectionOpen" :data="nftCollection" />-->
          <br />
          <div v-if="isMintDone" class="badge badge--info">
            <p>Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea.</p>
            <a :href='`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId}`' target="_blank">🌊 View Collection on OpenSea</a>
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
