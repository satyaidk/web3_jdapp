import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

export type EventItem = {
	id: string
	title: string
	description: string
	date: string
	location: string
	hashtags: string[]
	shortCode: string
	qrDataUrl?: string
	startMs: number
	endMs: number
}

export type ShareRecord = {
	id: string
	eventId: string
	platform: 'twitter' | 'linkedin'
	url: string
	timestamp: number
	verified: boolean
	reward: number
}

export type StakingPosition = {
	id: string
	amount: number
	startMs: number
	rewardPerDay: number
}

export type Company = {
	id: string
	name: string
	industry: string
	description: string
	location: string
	employees: string
	rating: number
	website?: string
	founded?: string
}

export type Job = {
	id: string
	title: string
	company: string
	location: string
	type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
	salary: string
	posted: string
	skills: string[]
	description?: string
	requirements?: string[]
	benefits?: string[]
}

export type Gig = {
	id: string
	title: string
	client: string
	budget: string
	duration: string
	level: 'Beginner' | 'Intermediate' | 'Expert'
	category: string
	description: string
	skills: string[]
	posted: string
	location?: string
	type?: 'Fixed Price' | 'Hourly'
}

export type User = {
	id: string
	email: string
	password: string
	fullName: string
	title: string
	about: string
	location?: string
	website?: string
	skills?: string[]
	experience?: string
	avatar?: string
	createdAt: number
}

type State = {
	address?: string
	events: EventItem[]
	pastEvents: EventItem[]
	shares: ShareRecord[]
	balance: number
	staked: StakingPosition[]
	companies: Company[]
	jobs: Job[]
	gigs: Gig[]
	users: User[]
	currentUser?: User
	isAuthenticated: boolean
	setAddress: (addr?: string) => void
	createEvent: (data: Omit<EventItem, 'id' | 'shortCode' | 'qrDataUrl'>) => EventItem
	addQrToEvent: (eventId: string, qrDataUrl: string) => void
	deleteEvent: (eventId: string) => void
	deletePastEvent: (eventId: string) => void
	purgeExpiredEvents: () => void
	recordShare: (share: Omit<ShareRecord, 'id' | 'timestamp' | 'verified' | 'reward'>) => ShareRecord
	verifyShare: (shareId: string, reward: number) => void
	stake: (amount: number) => StakingPosition
	unstake: (positionId: string) => void
	accrueRewards: () => number
	addCompany: (company: Omit<Company, 'id'>) => Company
	addJob: (job: Omit<Job, 'id'>) => Job
	addGig: (gig: Omit<Gig, 'id'>) => Gig
	signUp: (userData: Omit<User, 'id' | 'createdAt'>) => User
	signIn: (email: string, password: string) => User | null
	signOut: () => void
	updateProfile: (userData: Partial<User>) => void
}

const DAILY_REWARD_RATE = 0.02

export const useAppStore = create<State>()(persist((set, get) => ({
	address: undefined,
	events: [],
	pastEvents: [],
	shares: [],
	balance: 0,
	staked: [],
	companies: [],
	jobs: [],
	gigs: [],
	users: [],
	currentUser: undefined,
	isAuthenticated: false,
	setAddress: (addr) => set({ address: addr }),
	createEvent: (data) => {
		const shortCode = uuidv4().slice(0, 6)
		const item: EventItem = { id: uuidv4(), shortCode, ...data }
		set({ events: [item, ...get().events] })
		return item
	},
	addQrToEvent: (eventId, qrDataUrl) => set({
		events: get().events.map(e => e.id === eventId ? { ...e, qrDataUrl } : e),
	}),
	deleteEvent: (eventId) => set(state => ({
		events: state.events.filter(e => e.id !== eventId)
	})),
	deletePastEvent: (eventId) => set(state => ({
		pastEvents: state.pastEvents.filter(e => e.id !== eventId)
	})),
	purgeExpiredEvents: () => set(state => {
		const now = Date.now()
		const active: EventItem[] = []
		const expired: EventItem[] = [...state.pastEvents]
		for (const e of state.events) {
			if (e.endMs && e.endMs < now) expired.push(e)
			else active.push(e)
		}
		return { events: active, pastEvents: expired }
	}),
	recordShare: (share) => {
		const rec: ShareRecord = { id: uuidv4(), timestamp: Date.now(), verified: false, reward: 0, ...share }
		set({ shares: [rec, ...get().shares] })
		return rec
	},
	verifyShare: (shareId, reward) => set(state => {
		const updated = state.shares.map(s => s.id === shareId ? { ...s, verified: true, reward } : s)
		return { shares: updated, balance: state.balance + reward }
	}),
	stake: (amount) => {
		const pos: StakingPosition = { id: uuidv4(), amount, startMs: Date.now(), rewardPerDay: DAILY_REWARD_RATE }
		set(state => ({
			staked: [pos, ...state.staked],
			balance: state.balance - amount,
		}))
		return pos
	},
	unstake: (positionId) => set(state => {
		const pos = state.staked.find(p => p.id === positionId)
		if (!pos) return {}
		const days = (Date.now() - pos.startMs) / (1000 * 60 * 60 * 24)
		const reward = pos.amount * pos.rewardPerDay * days
		return {
			staked: state.staked.filter(p => p.id !== positionId),
			balance: state.balance + pos.amount + reward,
		}
	}),
	accrueRewards: () => {
		const now = Date.now()
		const total = get().staked.reduce((sum, p) => {
			const days = (now - p.startMs) / (1000 * 60 * 60 * 24)
			return sum + p.amount * p.rewardPerDay * days
		}, 0)
		return total
	},
	addCompany: (company) => {
		const newCompany: Company = { id: uuidv4(), ...company }
		set({ companies: [newCompany, ...get().companies] })
		return newCompany
	},
	addJob: (job) => {
		const newJob: Job = { id: uuidv4(), ...job }
		set({ jobs: [newJob, ...get().jobs] })
		return newJob
	},
	addGig: (gig) => {
		const newGig: Gig = { id: uuidv4(), ...gig }
		set({ gigs: [newGig, ...get().gigs] })
		return newGig
	},
	signUp: (userData) => {
		const existingUser = get().users.find(u => u.email === userData.email)
		if (existingUser) {
			throw new Error('User with this email already exists')
		}
		const newUser: User = { id: uuidv4(), createdAt: Date.now(), ...userData }
		set({ 
			users: [newUser, ...get().users],
			currentUser: newUser,
			isAuthenticated: true
		})
		return newUser
	},
	signIn: (email, password) => {
		const user = get().users.find(u => u.email === email && u.password === password)
		if (user) {
			set({ currentUser: user, isAuthenticated: true })
			return user
		}
		return null
	},
	signOut: () => {
		set({ currentUser: undefined, isAuthenticated: false })
	},
	updateProfile: (userData) => {
		const currentUser = get().currentUser
		if (!currentUser) return
		
		const updatedUser = { ...currentUser, ...userData }
		set({ 
			currentUser: updatedUser,
			users: get().users.map(u => u.id === currentUser.id ? updatedUser : u)
		})
	},
}), { name: 'scan2share-store' }))
