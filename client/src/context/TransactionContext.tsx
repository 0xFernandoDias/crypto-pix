import React, {
	Dispatch,
	SetStateAction,
	createContext,
	useEffect,
	useState,
} from "react"
import { ethers } from "ethers"
import { contractAbi, contractAddress } from "../utils/constants"

export const TransactionContext = createContext(
	{} as {
		connectWallet?: () => void
		currentAccount?: string
		formData?: {
			addressTo: string
			amount: string
			keyword: string
			message: string
		}
		setFormData: Dispatch<
			SetStateAction<{
				addressTo: string
				amount: string
				keyword: string
				message: string
			}>
		>
		handleChange?: (
			e: React.ChangeEvent<HTMLInputElement>,
			name: string
		) => void
		sendTransaction: () => void
	}
)

const { ethereum } = window

const getEthereumContract = async () => {
	// @ts-ignore
	const provider = new ethers.BrowserProvider(ethereum)

	const signer = await provider.getSigner()

	const transactionContract = new ethers.Contract(
		contractAddress,
		contractAbi,
		signer
	)

	return transactionContract
}

export const TransactionProvider = ({
	children,
}: {
	children: React.ReactNode
}) => {
	const [currentAccount, setCurrentAccount] = useState("")
	const [formData, setFormData] = useState({
		addressTo: "",
		amount: "",
		keyword: "",
		message: "",
	})
	const [isLoading, setIsLoading] = useState(false)
	const [transactionCount, setTransactionCount] = useState(
		localStorage.getItem("transactionCount")
	)

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		name: string
	) => {
		setFormData((prevState) => ({ ...prevState, [name]: e.target.value }))
	}

	const checkIfWalletIsConnected = async () => {
		try {
			if (!ethereum) {
				alert("Please install MetaMask first.")
			}

			const accounts = await ethereum.request({ method: "eth_accounts" })

			if (accounts.length) {
				setCurrentAccount(accounts[0])
			} else {
				console.log("No accounts found")
			}

			console.log(accounts)
		} catch (error) {
			console.log(error)

			throw new Error("No ethereum object found")
		}
	}

	const connectWallet = async () => {
		try {
			if (!ethereum) {
				alert("Get MetaMask!")
			}

			const accounts = await ethereum.request({ method: "eth_requestAccounts" })

			setCurrentAccount(accounts[0])
		} catch (error) {
			console.log(error)

			throw new Error("No ethereum object found")
		}
	}

	const sendTransaction = async () => {
		try {
			if (!ethereum) {
				alert("Get MetaMask!")
			}

			const { addressTo, amount, keyword, message } = formData

			const transactionContract = await getEthereumContract()

			const parsedAmount = ethers.parseUnits(amount)

			await ethereum.request({
				method: "eth_sendTransaction",
				params: [
					{
						from: currentAccount,
						to: addressTo,
						gas: "0x5208",
						// @ts-ignore
						value: parsedAmount.toString(),
					},
				],
			})

			const transactionHash = await transactionContract.addToBlockchain(
				addressTo,
				parsedAmount,
				message,
				keyword
			)

			setIsLoading(true)
			console.log(`Loading - ${transactionHash.hash}`)
			await transactionHash.wait()
			setIsLoading(false)
			console.log(`Success - ${transactionHash.hash}`)

			const transactionCount = await transactionContract.getTransactionCount()

			setTransactionCount(transactionCount)
		} catch (error) {
			console.log(error)

			throw new Error("No ethereum object found")
		}
	}

	useEffect(() => {
		checkIfWalletIsConnected()
	}, [])

	return (
		<TransactionContext.Provider
			value={{
				connectWallet,
				currentAccount,
				formData,
				setFormData,
				handleChange,
				sendTransaction,
			}}
		>
			{children}
		</TransactionContext.Provider>
	)
}
