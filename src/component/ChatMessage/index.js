import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react'
import './ChatMessage.css'
import { BsSearch } from 'react-icons/bs'
import { BiSend } from 'react-icons/bi'
import { get } from '../../httpHelper'
import authService from '../../services/auth.service'
import moment from 'moment'
import { socketUrl } from '../../constants/configUrl'
import SockJsClient from 'react-stomp'

export default function ChatMessage() {
    const historyRef = useRef()
    const [users, setUsers] = useState([])
    const [currentUser, setCurrentUser] = useState()
    const [selectedUser, setSelectedUser] = useState()
    const [messages, setMessages] = useState([])
    const [messageText, setMessageText] = useState('')
    const [connect, setConnect] = useState(false)
    const refSockJs = useRef(null)

    useEffect(() => {
        setCurrentUser(authService.getCurrentUser())
        fetchUsers()
    }, [])

    useLayoutEffect(() => {
        historyRef.current.scrollTop = historyRef.current.scrollHeight
    }, [messages])


    const fetchUsers = () => {
        get('/user').then(res => {
            const loggedIn = authService.getCurrentUser()
            if (loggedIn.role === 'ROLE_ADMIN') {
                setUsers(res.data.filter(u => u.username !== loggedIn.username && u.type === 'ROLE_STAFF'))
            } else {
                setUsers(res.data.filter(u => u.username !== loggedIn.username && u.type === 'ROLE_ADMIN'))
            }
        }).catch(error => console.log(error))
    }

    const fetchMessages = (user1, user2) => {
        get(`/firebase/messages?sender=${user1}&receiver=${user2}`)
            .then(res => {
                setMessages(res.data)
            }).catch(error => console.log(error))
    }

    const handleSelectedUser = (username) => {
        setSelectedUser(users.find(u => u.username === username))
        fetchMessages(currentUser?.username, username)
    }

    const handleReceiveMessage = (message) => {
        if (message.sender === selectedUser.username)
            setMessages([...messages, message])
    }

    const handleSend = () => {
        if (messageText.trim() === '') return
        const message = {
            sender: currentUser.username,
            receiver: selectedUser.username,
            content: messageText
        }

        refSockJs.current.sendMessage(
            `/app/chat/ + ${selectedUser.username}`,
            JSON.stringify(message)
        )
        setMessages([...messages, { ...message, time: new Date() }])
        setMessageText('')
    }

    return (
        <>
            <div className="row clearfix">
                <div className="col-lg-12">
                    <div className="card chat-app">
                        <div id="plist" className="people-list">
                            <div className="input-group">
                                <input type="text" class="form-control search-input" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1" />
                                <div className="input-group-prepend">
                                    <span class="input-group-text search-input-icon-wrap"><BsSearch /></span>
                                </div>
                            </div>
                            <ul className="list-unstyled chat-list mt-2 mb-0">
                                {users.map((u, index) => (
                                    <li key={index} className="clearfix" onClick={() => handleSelectedUser(u.username)}>
                                        <img src="https://bootdey.com/img/Content/avatar/avatar1.png" alt="avatar" />
                                        <div className="about">
                                            <div className="name">{u.fullName}</div>
                                            <div className="status"> <i className="fa fa-circle offline"></i> left 7 mins ago </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="chat">
                            <div className="chat-header clearfix">
                                <div className="row">
                                    <div className="col-lg-6">
                                        <a href="#" data-toggle="modal" data-target="#view_info">
                                            <img src="https://bootdey.com/img/Content/avatar/avatar2.png" alt="avatar" />
                                        </a>
                                        <div className="chat-about">
                                            <h6 className="m-b-0">{selectedUser?.fullName}</h6>
                                            <small>Last seen: 2 hours ago</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="chat-history" ref={historyRef}>
                                <ul className="m-b-0 chat-history-list">
                                    {messages.map(m => (
                                        m.sender === currentUser.username ?
                                            <>
                                                <li className="clearfix">
                                                    <div className="message-data text-right">

                                                        <span className="message-data-time">
                                                            {
                                                                (() => {
                                                                    const diff = new Date().getDate() - new Date(m.time).getDate()
                                                                    if (diff < -7) return moment(new Date(m.time)).format('MMM Do, h:mm a')
                                                                    return moment().subtract(diff, 'days').calendar()
                                                                })()
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="message other-message float-right">{m.content}</div>
                                                </li>
                                            </>
                                            :
                                            <>
                                                <li className="clearfix">
                                                    <div className="message-data">
                                                        <img src="https://bootdey.com/img/Content/avatar/avatar7.png" alt="avatar" />
                                                        <span className="message-data-time">
                                                            {
                                                                (() => {
                                                                    const diff = new Date().getDate() - new Date(m.time).getDate()
                                                                    if (diff < -7) return moment(new Date(m.time)).format('MMM Do, h:mm a')
                                                                    return moment().subtract(diff, 'days').calendar()
                                                                })()
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="message my-message">{m.content}</div>
                                                </li>
                                            </>
                                    ))}
                                </ul>
                            </div>
                            <div className="chat-message clearfix">
                                <div class="input-group mb-0">
                                    <textarea
                                        type="textarea"
                                        class="form-control message-input"
                                        placeholder="Enter message..."
                                        aria-label="Recipient's username"
                                        aria-describedby="button-addon2"
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                    />
                                    <div class="input-group-append">
                                        <span class="input-group-text message-input-icon-wrap" type="button" onClick={handleSend}><BiSend /></span>
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
                topics={[`/topic/messages/ + ${currentUser?.username}`]}
                onMessage={(msg) => { handleReceiveMessage(msg) }}
            />
        </>
    )
}
