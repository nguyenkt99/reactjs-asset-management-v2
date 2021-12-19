import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react'
import './ChatMessage.css'
import { BsSearch } from 'react-icons/bs'
import { BiSend } from 'react-icons/bi'
import { get, post } from '../../httpHelper'
import authService from '../../services/auth.service'
import moment from 'moment'
import { socketUrl } from '../../constants/configUrl'
import SockJsClient from 'react-stomp'
import { NavLink, useRouteMatch, useHistory } from 'react-router-dom'
import Avatar from '../../assets/avatar.png'
import { FormControl, InputGroup } from 'react-bootstrap'

export default function ChatMessage() {
    const historyRef = useRef()
    const refSockJs = useRef(null)
    const match = useRouteMatch()
    const history = useHistory()

    const conversationRef = useRef({})
    const [users, setUsers] = useState([])
    const [dataUsers, setDataUsers] = useState([])
    const [conversations, setConversations] = useState([])
    const [selectedConversation, setSelectedConversation] = useState()
    const [currentUser, setCurrentUser] = useState()
    // const [selectedUser, setSelectedUser] = useState()
    const [messages, setMessages] = useState([])
    const [messageText, setMessageText] = useState('')
    const [searchValue, setSearchValue] = useState('')
    // const [newConversation, setNewConversation] = useState({})
    const [showListSearch, setShowListSearch] = useState(false)
    const [connect, setConnect] = useState(false)


    useEffect(() => {
        setCurrentUser(authService.getCurrentUser())
        fetchUsers()
        fetchConversations()
    }, [])

    useEffect(() => {
        if (selectedConversation?.id)
            fetchMessages(selectedConversation.id)
        else 
            setMessages([])
    }, [selectedConversation])

    useEffect(() => {
        setUsers(dataUsers.filter(u => u.fullName.toLowerCase().includes(searchValue.toLowerCase())
            || u.username.toLowerCase().includes(searchValue.toLowerCase())))
    }, [searchValue])

    useLayoutEffect(() => {
        historyRef.current.scrollTop = historyRef.current.scrollHeight
    }, [messages])

    const fetchConversations = () => {
        get('/conversation').then(res => {
            setConversations(res.data)
            setSelectedConversation(res.data[0])
        }).catch(error => console.log(error))
    }

    const fetchMessages = (conversationId) => {
        if (conversationId)
            get(`/conversation/${conversationId}`)
                .then(res => {
                    setMessages(res.data)
                }).catch(error => console.log(error))
    }

    const fetchUsers = () => {
        get('/user').then(res => {
            const loggedIn = authService.getCurrentUser()
            const newUsers = res.data.filter(u => u.username !== loggedIn.username && u.type !== loggedIn.role)
            setUsers(newUsers)
            setDataUsers(newUsers)
        }).catch(error => console.log(error))
    }

    const handleOnConnect = () => {
        setConnect(true)
    }

    const handleClickItemSearch = (user) => {
        // create converation temp
        if (!conversations.some(c => c.username1 === user.username || c.username2 === user.username)) {
            let newConversation = {
                id: null,
                username1: currentUser.username,
                username2: user.username,
                fullName2: user.fullName,
                isSeen: true
            }
            setSelectedConversation(newConversation)
            setConversations([newConversation, ...conversations])
        }
        history.push(`/messenger/${user.username}`)
    }

    const handleSelectedConversation = (c) => {
        setSelectedConversation(c)
        let newConversations = [...conversations]
        // const index = newConversations.findIndex((conversation) => conversation.id === c.id)
        const index = conversations.findIndex(con =>
            con.id === c.id &&
            ((con.username1 === c.username1 && con.username2 === c.username2)
                || (con.username1 === c.username2 && con.username2 === c.username1)))
        newConversations[index] = { ...c, isSeen: true }
        setConversations(newConversations)
        if (!c.isSeen && c.id)
            post(`/conversation/${c.id}/seen`)

        // if (c.id) { // old conversation
        //     fetchMessages(c.id)
        // } else { // new conversation then message is empty
        //     setMessages([])
        // }
    }

    // const renderConversations = (newMessage, type = 'SEND') => {
    //     const isSeen = type === 'RECEIVE' ? false : true
    //     let newConversations = [...conversations]
    //     let index = conversations.findIndex(c => c.id === newMessage.conversationId
    //         || (c.username1 === currentUser.username && c.username2 === newMessage.sender) || (c.username1 === newMessage.sender && c.username2 === currentUser.username))
    //     if (index === -1) {
    //         const newConversation = {
    //             id: newMessage.conversationId,
    //             username1: newMessage.sender,
    //             fullName1: newMessage.fullName,
    //             lastMessage: newMessage.content,
    //             time: newMessage.time,
    //             isSeen: false
    //         }
    //         newConversations = [newConversation, ...newConversations]
    //     } else {
    //         newConversations[index] = { ...newConversations[index], lastMessage: newMessage.content, time: newMessage.time, isSeen: isSeen }
    //         newConversations.unshift(newConversations.splice(index, 1)[0])
    //     }

    //     setConversations(newConversations)
    // }

    const renderConversations = (newMessage) => {
        let newConversations = [...conversations]
        const isSeen = newMessage.sender === currentUser.username ? true : false
        let index = conversations.findIndex(c => {
            return c.id === newMessage.conversationId
                || (c.username1 === currentUser.username && c.username1 === newMessage.sender)
                || (c.username1 === currentUser.username && c.username2 === newMessage.sender)
                || (c.username1 === newMessage.sender && c.username2 === currentUser.username)
        })

        if (index === -1) { // receive new conversation
            const newConversation = {
                id: newMessage.conversationId,
                username1: newMessage.sender,
                fullName1: newMessage.fullName,
                lastMessage: newMessage.content,
                time: newMessage.time,
                isSeen: isSeen
            }
            newConversations = [newConversation, ...conversations]
        } else {
            newConversations[index] = {
                ...newConversations[index],
                id: newMessage.conversationId,
                lastMessage: newMessage.content,
                time: newMessage.time,
                isSeen: isSeen
            }
            newConversations.unshift(newConversations.splice(index, 1)[0])
        }
        console.log(newConversations)
        setConversations(newConversations)
    }

    // const handleReceiveMessage = (message) => {
    //     // use for new conversation (be sent to mine!!!) to get new conversation Id
    //     if (message.sender === currentUser?.username && selectedConversation?.id === null) {
    //         let newConversations = [...conversations]
    //         const index = conversations.findIndex(c => c.id === null)
    //         let newConversation = newConversations.splice(index, 1)[0]
    //         newConversation = {
    //             ...newConversation,
    //             id: message.conversationId,
    //             fullName1: message.fullName,
    //             lastMessage: message.content,
    //             time: message.time,
    //             sender: message.sender,
    //         }

    //         setConversations([newConversation, ...newConversations])
    //         setSelectedConversation(newConversation)
    //     }

    //     // render conservation
    //     if (message.sender !== currentUser?.username) {
    //         renderConversations(message, 'RECEIVE')
    //     } else {
    //         renderConversations(message)
    //     }

    //     // render chat window when receive message
    //     if (message.sender === getUserIsChating(selectedConversation)?.username)
    //         setMessages([...messages, message])
    // }

    const getUserIsChating = (conversation) => {
        if (conversation) {
            const user = conversation.username1 !== currentUser.username ?
                {
                    username: conversation.username1,
                    fullName: conversation.fullName1
                } :
                {
                    username: conversation.username2,
                    fullName: conversation.fullName2
                }
            return user;
        }
    }

    const handleReceiveMessage = (message) => {
        // set conversationId for selectedConversation
        if(!selectedConversation.id && selectedConversation.username1 === message.sender) {
            setSelectedConversation({...selectedConversation, id: message.conversationId})
        }
        
        // render conservation
        renderConversations(message)

        // render chat window when receive message
        if (message.sender === getUserIsChating(selectedConversation)?.username)
            setMessages([...messages, message])

    }

    const handleSend = () => {
        if (connect && selectedConversation) { // if websocket has been connnected then send the message
            if (messageText.trim() === '') return

            // preparing form data to send
            const message = {
                sender: currentUser.username,
                content: messageText.trim(),
                conversationId: selectedConversation?.id
            }

            // determine receiver
            let to = ''
            if (selectedConversation) {
                to = getUserIsChating(selectedConversation).username
            }

            // send message
            refSockJs.current.sendMessage(
                `/app/chat/${to}`,
                JSON.stringify(message)
            )

            // render chat window
            setMessages([...messages, { ...message, time: new Date() }])
            setMessageText('')
        }
    }

    const MenuLink = ({ conversationId, isSeen, sender, children, to, click }) => {
        return (
            <li
                id={conversationId}
                className={match.url === to ? 'is-active-messenger clearfix' : 'clearfix'}
                ref={el => conversationRef.current[conversationId] = el} onClick={click}
                style={!isSeen && (sender !== currentUser.username) ? { fontWeight: "bold" } : {}}
            >
                <NavLink to={to} >
                    {children}
                </NavLink>
            </li>
        )
    }

    return (
        <>
            <div className="row clearfix">
                <div className="col-lg-12">
                    <div className="card chat-app">
                        <div id="plist" className="people-list">
                            <div className='search-people-input-wrap'>
                                <InputGroup className="mb-4">
                                    <FormControl
                                        placeholder="Search people..."
                                        className="search-people-input"
                                        onFocus={() => setShowListSearch(true)}
                                        onBlur={() => setTimeout(() => {
                                            setShowListSearch(false)
                                        }, 200)}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                    />
                                    <InputGroup.Text><BsSearch className='search-input-icon' /></InputGroup.Text>
                                    <div className="search-people" style={{ display: showListSearch ? 'block' : 'none' }}>
                                        <ul className="search-people-list">
                                            {users.map(u => (
                                                <li key={u.staffCode} className="search-people-item" onClick={() => handleClickItemSearch(u)}>
                                                    <img className="search-people-avatar" src={Avatar} alt="avatar" />
                                                    <span className='search-fullname'>
                                                        {u.fullName}
                                                    </span>
                                                    <span className='search-username'> ({u.username})</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </InputGroup>
                            </div>

                            <ul className="list-unstyled chat-list mt-2 mb-0">
                                {(() => {
                                    // console.log(conversations)
                                    return conversations?.map((c, index) => (
                                        c.username1 === currentUser.username ?
                                            <MenuLink conversationId={c.id} isSeen={c.isSeen} sender={c.sender} key={index} label={c.fullName2} to={`/messenger/${c.username2}`} click={() => handleSelectedConversation(c)}>
                                                <img src={Avatar} alt="avatar" />
                                                <div className="about">
                                                    <div className="name">{c.fullName2}</div>
                                                    <div className="status last-message">
                                                        <span className="last-message-content">
                                                            {c.lastMessage}
                                                        </span>
                                                        <span className="last-message-dot">•</span>
                                                        <span className="last-message-time">
                                                            {c.time ? moment(c.time).fromNow(true) : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </MenuLink>
                                            :
                                            <MenuLink conversationId={c.id} isSeen={c.isSeen} sender={c.sender} key={index} label={c.fullName1} to={`/messenger/${c.username1}`} click={() => handleSelectedConversation(c)}>
                                                <img src={Avatar} alt="avatar" />
                                                <div className="about">
                                                    <div className="name">{c.fullName1}</div>
                                                    <span className="last-message-content">
                                                        {c.lastMessage}
                                                    </span>
                                                    <span className="last-message-dot">•</span>
                                                    <span className="last-message-time">
                                                        {moment(c.time).fromNow(true)}
                                                    </span>
                                                </div>
                                            </MenuLink>
                                    ))
                                })()}
                            </ul>
                        </div>
                        <div className="chat">
                            <div className="chat-header clearfix">
                                <div className="row">
                                    <div className="col-lg-6">
                                        {/* <a href="#" data-toggle="modal" data-target="#view_info"> */}
                                        <img src={Avatar} alt="avatar" />
                                        {/* </a> */}
                                        <div className="chat-about">
                                            <h6 className="m-b-0" style={{ fontSize: "1.6rem" }}>{getUserIsChating(selectedConversation)?.fullName} <span style={{ fontSize: "1.4rem", fontWeight: "400" }}>({getUserIsChating(selectedConversation)?.username})</span></h6>
                                            {/* <small>{selectedUser?.type === 'ROLE_STAFF' ? 'Staff' : 'Admin'}</small> */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="chat-history" ref={historyRef}>
                                <ul className="m-b-0 chat-history-list">
                                    {messages.map((m, index) => (
                                        m.sender === currentUser.username ?
                                            <li key={index} className="clearfix">
                                                <div className="message-data text-right">
                                                    <span className="message-data-time">
                                                        {
                                                            (() => {
                                                                const diff = new Date().getDate() - new Date(m.time).getDate()
                                                                if (diff < -7) return moment(new Date(m.time)).format('MMM D, h:mm a')
                                                                return moment(new Date(m.time)).calendar()
                                                            })()
                                                        }
                                                    </span>
                                                </div>
                                                <div className="message other-message float-right">{m.content}</div>
                                            </li>
                                            :
                                            <li key={index} className="clearfix">
                                                <div className="message-data">
                                                    {/* <img src={Avatar} alt="avatar" /> */}
                                                    <span className="message-data-time">
                                                        {
                                                            (() => {
                                                                const diff = new Date().getDate() - new Date(m.time).getDate()
                                                                if (diff < -7) return moment(new Date(m.time)).format('MMM D, h:mm a')
                                                                return moment(new Date(m.time)).calendar()
                                                            })()
                                                            // console.log(new Date().getDate(), new Date(m.time).getDate())

                                                        }
                                                    </span>
                                                </div>
                                                <div className="message my-message">{m.content}</div>
                                            </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="chat-message clearfix">
                                <div className="input-group mb-0">
                                    <input
                                        type="text"
                                        className="form-control message-input"
                                        placeholder="Enter message..."
                                        aria-label="Recipient's username"
                                        aria-describedby="button-addon2"
                                        value={messageText}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSend()
                                            }
                                        }}
                                        onChange={(e) => setMessageText(e.target.value)}
                                    />
                                    <div className="input-group-append">
                                        <span className="input-group-text message-input-icon-wrap" type="button" onClick={handleSend}><BiSend /></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <SockJsClient
                ref={refSockJs}
                url={socketUrl + '/chat'}
                topics={[`/topic/messages/${currentUser?.username}`]}
                onMessage={(msg) => { handleReceiveMessage(msg) }}
                onConnect={handleOnConnect}
            />
        </>
    )
}
