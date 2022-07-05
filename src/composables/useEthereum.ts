import {ref} from "vue";
import {ethers} from "ethers";
import myEpicNft from "../utils/MyEpicNFT.json";
import {createToast} from 'mosha-vue-toastify';
import 'mosha-vue-toastify/dist/style.css'
import {useHelpers} from "./useHelpers";

interface ApiError {
    code: number;
    message: string;
}

export function useEthereum(CONTRACT_ADDRESS: string) {
    // @ts-ignore
    const { ethereum } = window;

    const currentAccount = ref('')
    const currentChainId = ref('')
    const isMinting = ref(false)
    const isMintDone = ref(false)
    const tokenId = ref('')
    const totalMinted = ref()
    const nftCollection = ref([])
    const total = ref(0)

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

    connectedContract.maxMintAmount().then((res: any) => {
        total.value = res
    })

    console.log(connectedContract.maxMintAmount())


    const { createTypedToaster } = useHelpers()

    const getCollection = (WALLET_ADDRESS: string) => {
        fetch(
            `https://testnets-api.opensea.io/api/v1/collections?asset_owner=${WALLET_ADDRESS}`, {
                method: 'GET', headers : { Accept: "application/json" }
            }
        ).then(response => response.json()
        ).then(data => {
            nftCollection.value = data
        });
    }


    const getTotalMinted = () => {
        // connectedContract.balanceOf(WALLET_ADDRESS).then(res => {
        //     console.log(res, parseInt(res))
        // })
        connectedContract.count().then((res: any) => { totalMinted.value = parseInt(res)})
    }


    const chainListener = (chainId: string) => {
        currentChainId.value = chainId

        const rinkebyChainId = "0x4";
        if (chainId !== rinkebyChainId) {
            createTypedToaster("You are not connected to the Rinkeby Test Network!",  'danger')
        } else {
            createTypedToaster('Chain changed to Rinkeby', 'success')
        }
    }


    const accountListener = (accounts: string[]) => {
        if (!currentAccount.value && accounts.length > 0) {
            createTypedToaster('You are connected',  'success')
        } else if (currentAccount.value.length > 0 && accounts.length === 0) {
            createTypedToaster('Account is blocked', 'success')
        } else if (currentAccount.value.length > 0 && accounts.length > 0) {
            createTypedToaster('Accounts are switched',  'success')
        }
        currentAccount.value = accounts[0]
        getCollection(currentAccount.value)
    }

    const nftMintedListener = (from: any, _tokenId: any) => {
        tokenId.value = _tokenId.toNumber()
    }

    const setupEventListener = async () => {
        try {
            if (ethereum) {
                connectedContract.on('NewEpicNFTMinted', nftMintedListener)
                ethereum.on('chainChanged', chainListener)
                ethereum.on('accountsChanged', accountListener)
                getTotalMinted()
            }
            else {
                createTypedToaster("Make sure you have metamask!", 'danger')
            }
        } catch (err) {
            createTypedToaster('MetaMask Error: ' + (err as ApiError).message,  'danger')
        }
    }

    const checkIfWalletIsConnected = async () => {
        if (!ethereum) {
            createTypedToaster("Make sure you have metamask!",  'danger')
            return;
        }

        try {
            const accounts = await ethereum.request({method: 'eth_accounts'})

            if (accounts.length !== 0) {
                currentAccount.value = accounts[0]
                getCollection(currentAccount.value)
                getTotalMinted()
                currentChainId.value = await ethereum.request({method: 'eth_chainId'})
            }
        }
        catch (err) {
            createTypedToaster('MetaMask Error: ' + (err as ApiError).message,  'danger')
        }
    }

    const connectWallet = async () => {
        try {
            if (!ethereum) {
                createTypedToaster("Get MetaMask!", 'danger')
                return;
            }

            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            currentAccount.value = accounts[0]
            getCollection(currentAccount.value)

            getTotalMinted()
            currentChainId.value = await ethereum.request({method: 'eth_chainId'})

        } catch (err) {
            createTypedToaster('MetaMask Error: ' + (err as ApiError).message, 'danger')
        }
    }

    const askContractToMintNft = async () => {
        isMintDone.value = false

        if (!currentAccount.value) {
            createTypedToaster('Account is blocked', 'warning')
            return
        }

        try {
            if (ethereum) {
                let nftTxn = await connectedContract.makeAnEpicNFT();
                isMinting.value = true

                console.log("Minting...please wait.")
                await nftTxn.wait();
                isMinting.value = false
                isMintDone.value = true
                getTotalMinted()
                console.log(`Minted, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

            } else {
                createTypedToaster("Get MetaMask",'danger')
            }
        } catch (err) {
            createTypedToaster('MetaMask Error: ' + (err as ApiError).message, 'danger')
        }
    }


    const switchChain = async () => {
        try {
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x4' }],
            });
        } catch (switchError) {
            if ((switchError as ApiError).code === 4902) {
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
                    createTypedToaster('New chain added', 'success')
                } catch (err) {
                    createTypedToaster('MetaMask Error: ' + (err as ApiError).message, 'danger')
                }
            }

            createTypedToaster('MetaMask Error: ' + (switchError as ApiError).message, 'danger')
        }
    }

    return {
        currentAccount,
        currentChainId,
        isMinting,
        isMintDone,
        tokenId,
        totalMinted,
        nftCollection,
        total,
        setupEventListener,
        checkIfWalletIsConnected,
        connectWallet,
        askContractToMintNft,
        switchChain,
    }
}
