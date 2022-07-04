import {ref} from "vue";
import {ethers} from "ethers";
import myEpicNft from "../utils/MyEpicNFT.json";
import { createToast } from 'mosha-vue-toastify';
import 'mosha-vue-toastify/dist/style.css'

export function useEthereum(CONTRACT_ADDRESS: string) {
    const { ethereum } = window;

    const currentAccount = ref('')
    const currentChainId = ref('')
    const isMinting = ref(false)
    const isMintDone = ref(false)
    const tokenId = ref()

    const setupEventListener = async () => {
        try {
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);


                connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
                        tokenId.value = tokenId.toNumber()
                    }
                );

                ethereum.on('accountsChanged', (accounts: string[]) => {
                    createToast(accounts.length > 0 ? 'Accounts changed' : 'Account blocked')
                    currentAccount.value = accounts[0]
                })


                ethereum.on('chainChanged', (chainId: string) => {
                    // createToast('Chain changed')
                    currentChainId.value = chainId

                    const rinkebyChainId = "0x4";
                    if (chainId !== rinkebyChainId) {
                        createToast("You are not connected to the Rinkeby Test Network!")
                    } else {
                        createToast('Chain changed to Rinkeby')
                    }
                });
            } else {
                createToast("Make sure you have metamask!")
            }
        } catch (err) {
            createToast(err.message)

        }
    }

    const checkIfWalletIsConnected = async () => {
        if (!ethereum) {
            createToast("Make sure you have metamask!")
            return;
        } else {
            console.log("We have the ethereum object", ethereum);
        }

        const accounts = await ethereum.request({ method: 'eth_accounts' })

        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found an authorized account:", account);

            let chainId = await ethereum.request({ method: 'eth_chainId' });
            currentChainId.value = chainId

            currentAccount.value = account
        } else {
            console.log("No authorized account found");
        }
    }

    const connectWallet = async () => {
        try {
            if (!ethereum) {
                createToast("Get MetaMask!", {
                    position: 'bottom-right',
                    type: 'danger',
                    transition: 'slide',
                })
                return;
            }

            const accounts = await ethereum.request({ method: "eth_requestAccounts" });


        } catch (err) {
            createToast(err.message, {
                position: 'bottom-right',
                type: 'danger',
                transition: 'slide',
            })

        }
    }

    const askContractToMintNft = async () => {
        isMintDone.value = false

        if (!currentAccount.value) {
            createToast('Account is blocked', {
                position: 'bottom-right',
                type: 'warning',
                transition: 'slide',
            })
            return
        }
        try {
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

                console.log("Going to pop wallet now to pay gas...")
                let nftTxn = await connectedContract.makeAnEpicNFT();

                isMinting.value = true

                console.log("Mining...please wait.")
                await nftTxn.wait();
                isMinting.value = false



                isMintDone.value = true
                console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

            } else {
                createToast("Get MetaMask",{
                    position: 'bottom-right',
                    type: 'danger',
                    transition: 'slide',
                })
            }
        } catch (err) {
            createToast(err.message, {
                position: 'bottom-right',
                type: 'danger',
                transition: 'slide',
            })

        }
    }

    const switchChain = async () => {
        try {
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x4' }],
            });

        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: '0x4',
                                chainName: 'Rinkeby Test Network',
                                rpcUrls: ['https://rinkeby.infura.io/v3/']
                            },
                        ],
                    });
                    createToast('New chain added', {
                        position: 'bottom-right',
                        type: 'success',
                        transition: 'slide',
                    })
                } catch (err) {
                    createToast(err.message, {
                        position: 'bottom-right',
                        type: 'danger',
                        transition: 'slide',
                    })
                }
            }

            createToast(switchError.message, {
                position: 'bottom-right',
                type: 'danger',
                transition: 'slide',
            })
        }
    }

    return {
        currentAccount,
        currentChainId,
        isMinting,
        isMintDone,
        tokenId,
        setupEventListener,
        checkIfWalletIsConnected,
        connectWallet,
        switchChain,
    }
}
