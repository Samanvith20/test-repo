"use client";
import React from "react";
import { useState, useRef } from "react";
import { Poppins } from "next/font/google";
import { useEffect } from "react";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
import Image from "next/image";
import RequestSession from "../components/RequestSession";
import { useSession } from "next-auth/react";
import io from "socket.io-client";
import { useRouter, useSearchParams } from "next/navigation";
import Shimmer from "../Shimmer";
import Link from "next/link";
import ViewTutor from "../components/ViewTutor";

const Spinner = () => (
  <div className="w-full flex justify-center items-center h-[400px]">
    <div className="w-[70px] h-[70px] border-t-[4px] border-b-[4px] border-black rounded-[50%] animate-spin"></div>
  </div>
);
const Page = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { data: session } = useSession();
  const [chats, setChats] = useState([]);
  const [backendmessage, setBackendMessages] = useState([]);
  const [tutorId, setTutorId] = useState(null);
  const [message, setMessage] = useState("");
  const socketRef = useRef(null);
  const previousRoomIdRef = useRef(null);
  const messagesContainerRef = useRef(null); // Ref for the messages container
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const [selectedChatIndex, setSelectedChatIndex] = useState(null);
  const [showScrollToBottomButton, setShowScrollToBottomButton] =
    useState(false);
  const [viewTutor, setViewTutor] = useState(null);
  const [requestSessionId, setRequestSessionId] = useState(null);
  const [smallScreens, setSmallScreens] = useState(false);
  const [loading, setLoading] = useState(false);

  // console.log("chat", chats);

  const displayRef = useRef();

  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollTop = displayRef?.current.scrollHeight;
    }
  }, [backendmessage, chats]);

  useEffect(() => {
    // Ensure this runs only on the client side
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const tutorId = searchParams.get("tutorId");
      setTutorId(tutorId);
    }
  }, []);

  // console.log("tutorId", tutorId);
  // console.log("chats", chats);

  const fetchTutorData = async () => {
    if (tutorId) {
      try {
        const response = await fetch(`/api/chatDummy?id=${tutorId}`);

        const data = await response.json();
        // setTutorData(data);
        return data;
      } catch (error) {
        // Assuming you have a setError state for handling errors
        console.error("Error fetching tutor data:", error);
      }
    }
  };

  const role = session?.role;
  const sessionId = session?.id;
  // console.log("sessionId", sessionId);

  const fetchChats = async () => {
    try {
      setLoading(true); // Start loading
      setLoadingMessages(true);
      if (!sessionId) {
        console.error("SessionId is undefined.");
        return;
      }

      // Include searchTerm as a query parameter if it exists
      const query = searchTerm ? `?searchTerm=${searchTerm}` : "";

      const response = await fetch(`/api/ChatDetails${query}`);
      if (!response.ok) {
        console.error("Error fetching chats:", response.statusText);
        return;
      }

      const data = await response.json();

      let newdata = [...data];

      // Add tutor details if tutorId is provided but not already in chats
      if (tutorId && !data.some((chat) => chat.tutorId === tutorId)) {
        const tutorDetails = await fetchTutorData();

        const tutor = {
          latestMessages: "",
          latestMessageTime: "",
          messages: [],
          roomId: `${sessionId}_${tutorId}`,
          studentId: sessionId,
          tutorId,
          tutorName: tutorDetails?.name,
          tutorPhoto: tutorDetails?.pic,
        };
        newdata.unshift(tutor);
      }

      setChats(newdata);
      // Update state with fetched data
      if (displayRef.current) {
        displayRef.current.scrollTop = displayRef.current.scrollHeight;
      }
    } catch (error) {
      console.error("Error in fetchChats:", error);
    } finally {
      setLoading(false);
      setLoadingMessages(false);
    }
  };

  // Refetch chats whenever sessionId, tutorId, or searchTerm changes
  useEffect(() => {
    fetchChats();
  }, [sessionId, tutorId, searchTerm]);

  const handleChatClick = (index) => {
    setSelectedChatIndex(index);

    if (window.innerWidth <= 1024) {
      setSmallScreens(true);
    } else {
      setSmallScreens(false);
    }

    router.push(`/chat`);
  };

  const handleBack = () => {
    if (window.innerWidth <= 1024) {
      setSmallScreens(false);
    }
  };
  // WebSocket initialization
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
        path: "/api/Socketio/Socketio",
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to Socket.IO server:", socketRef.current.id);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from Socket.IO server");
      });

      // Handler for loading past messages
      const loadPastMessagesHandler = (data) => {
        console.log(`Received loadPastMessages for ${session?.role}:`, data);

        if (data.roomId === socketRef.current.currentRoomId) {
          setBackendMessages(data.allMessages);
        }
      };

      // Handler for new messages
      const newMessageHandler = (newMessage) => {
        console.log(`Received newMessage for ${session?.role}:`, newMessage);

        // Update chats to reflect the latest message
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.roomId === newMessage.roomId
              ? {
                  ...chat,
                  latestMessage: newMessage.message,
                  latestMessageTime: newMessage.timestamp,
                }
              : chat
          )
        );
        if (
          chats[selectedChatIndex]?.roomId === newMessage.roomId &&
          selectedChatIndex !== null
        ) {
          setBackendMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      };

      // Listen for the events from the server
      socketRef.current.on("loadPastMessages", loadPastMessagesHandler);
      socketRef.current.on("newMessage", newMessageHandler);

      // Cleanup WebSocket connection on unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [session?.id, chats, selectedChatIndex]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setViewTutor(null);
      }
    };

    if (viewTutor) {
      document.addEventListener("keydown", handleEscape);
    } else {
      document.removeEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [viewTutor]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setTutorId(null);
      }
    };

    if (tutorId) {
      document.addEventListener("keydown", handleEscape);
    } else {
      document.removeEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [tutorId]);

  useEffect(() => {
    if (viewTutor || requestSessionId) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => document.body.classList.remove("overflow-hidden");
  }, [viewTutor, requestSessionId]);

  // Handle room changes
  useEffect(() => {
    if (!session) {
      console.log("Session not available.");
      return;
    }

    let roomId;

    if (session.role === "tutor") {
      roomId = chats[selectedChatIndex]?.roomId;
    } else {
      roomId = chats[selectedChatIndex]?.roomId;
    }

    if (socketRef.current && roomId) {
      // Leave previous room if any
      if (previousRoomIdRef.current && previousRoomIdRef.current !== roomId) {
        socketRef.current.emit("leaveRoom", {
          roomId: previousRoomIdRef.current,
        });
      }

      // Update previousRoomIdRef
      previousRoomIdRef.current = roomId;

      // Emit the joinRoom event with the new roomId
      socketRef.current.emit("joinRoom", { roomId });

      // Update the current roomId in socketRef
      socketRef.current.currentRoomId = roomId;

      // Reset messages when room changes
      setBackendMessages([]);
    }
  }, [session?.id, session?.role, chats, selectedChatIndex]);

  // Sending messages
  const sendMessage = () => {
    let roomId;
    if (session?.role === "tutor") {
      roomId = chats[selectedChatIndex]?.roomId;
    } else {
      roomId = chats[selectedChatIndex]?.roomId;
    }

    console.log("Sending message to room:", roomId);

    if (message.trim() && roomId) {
      socketRef?.current?.emit(
        "sendMessage",
        {
          roomId,
          senderId: session.id,
          message,
        },
        (response) => {
          if (response?.success) {
            console.log("Message successfully sent and saved.");

            setBackendMessages((prevMessages) => {
              const updatedMessages = [
                ...prevMessages,
                {
                  roomId,
                  sender: session.id,
                  message,
                  timestamp: new Date().toISOString(),
                },
              ];
              return updatedMessages;
            });
          } else {
            console.error("Error saving message:", response?.error);
          }
        }
      );

      setMessage(""); // Clear input field after sending
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  function getDateLabel(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date >= today) {
      return "Today";
    } else if (date >= yesterday) {
      return "Yesterday";
    } else {
      // Format date as "Month Day, Year"
      return date.toLocaleDateString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  }

  const handleViewTutor = (viewTutor) => {
    setViewTutor(viewTutor);
  };
  // console.log("viewTutor", viewTutor);

  const handleRequestSession = (tutorId) => {
    setRequestSessionId(tutorId);
  };

  return (
    <div className={` ${poppins.className} container `}>
      <div className="flex  gap-5 p-5">
        {/* chat details for lesthan md */}
        {!smallScreens && (
          <div className="bg-[#FFF] block lg:hidden w-[100%] h-[100vh] border-solid	border-[1px]  border-[rgba(0,0,0,0.05)] rounded-[16px]	">
            <div className="bg-[rgba(30,141,143,0.44)] h-[40px] my-6 w-[40px] flex justify-center items-center rounded-[50%]">
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.152 5.4937H2.8437L6.91037 1.42704C7.23537 1.10204 7.23537 0.568703 6.91037 0.243703C6.83328 0.16645 6.7417 0.105161 6.64089 0.0633426C6.54008 0.0215248 6.43201 0 6.32287 0C6.21373 0 6.10566 0.0215248 6.00485 0.0633426C5.90404 0.105161 5.81246 0.16645 5.73537 0.243703L0.243704 5.73537C0.166451 5.81246 0.105161 5.90404 0.063343 6.00485C0.0215252 6.10566 0 6.21373 0 6.32287C0 6.43201 0.0215252 6.54008 0.063343 6.64089C0.105161 6.7417 0.166451 6.83328 0.243704 6.91037L5.73537 12.402C5.81252 12.4792 5.90411 12.5404 6.00492 12.5821C6.10572 12.6239 6.21376 12.6454 6.32287 12.6454C6.43198 12.6454 6.54002 12.6239 6.64082 12.5821C6.74163 12.5404 6.83322 12.4792 6.91037 12.402C6.98752 12.3249 7.04872 12.2333 7.09048 12.1325C7.13223 12.0317 7.15372 11.9236 7.15372 11.8145C7.15372 11.7054 7.13223 11.5974 7.09048 11.4966C7.04872 11.3958 6.98752 11.3042 6.91037 11.227L2.8437 7.16037H12.152C12.6104 7.16037 12.9854 6.78537 12.9854 6.32704C12.9854 5.8687 12.6104 5.4937 12.152 5.4937Z"
                  fill="black"
                />
              </svg>
            </div>

            <div className="flex justify-center px-4	">
              <div className="flex items-center w-[90%]   bg-[#F6F6F6] p-2  border-[1px] border-solid	 border-[rgba(0,0,0,0.05)] shadow-md rounded-lg	">
                <input
                  type="text"
                  placeholder="Search by name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="outline-none bg-transparent font-normal  pl-1 not-italic	text-[#888]  placeholder-gray-400 w-full"
                />
                <div className="pr-4">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M11.9875 12.8721C10.8643 13.7695 9.44013 14.2028 8.00744 14.083C6.57475 13.9631 5.24232 13.2992 4.28382 12.2277C3.32532 11.1561 2.81351 9.75822 2.8535 8.32109C2.89349 6.88395 3.48224 5.51667 4.49884 4.50007C5.51545 3.48346 6.88273 2.89471 8.31986 2.85472C9.757 2.81473 11.1549 3.32654 12.2265 4.28504C13.298 5.24354 13.9619 6.57597 14.0817 8.00866C14.2016 9.44135 13.7683 10.8656 12.8709 11.9888L17.1675 16.2846C17.2289 16.3418 17.2782 16.4108 17.3123 16.4875C17.3465 16.5641 17.3649 16.6469 17.3664 16.7308C17.3678 16.8147 17.3524 16.8981 17.321 16.9759C17.2895 17.0537 17.2427 17.1244 17.1834 17.1838C17.124 17.2431 17.0534 17.2899 16.9755 17.3214C16.8977 17.3528 16.8143 17.3682 16.7304 17.3667C16.6465 17.3653 16.5637 17.3469 16.4871 17.3127C16.4104 17.2786 16.3414 17.2293 16.2842 17.1679L11.9875 12.8721ZM5.38253 11.5704C4.7709 10.9587 4.35433 10.1794 4.18546 9.33106C4.01659 8.48268 4.10301 7.60328 4.43379 6.804C4.76457 6.00472 5.32487 5.32144 6.04388 4.8405C6.76288 4.35957 7.60832 4.10257 8.47334 4.10199C9.33836 4.10141 10.1841 4.35727 10.9038 4.83723C11.6234 5.3172 12.1847 5.99973 12.5165 6.79856C12.8484 7.5974 12.936 8.47668 12.7683 9.32529C12.6005 10.1739 12.185 10.9537 11.5742 11.5663L11.57 11.5704L11.5659 11.5738C10.7451 12.3926 9.63289 12.8522 8.47351 12.8516C7.31413 12.8509 6.2024 12.3902 5.38253 11.5704Z"
                      fill="#4F4F4F"
                    />
                  </svg>
                </div>
              </div>
            </div>
            {/* Display loading spinner */}
            {/* {loading && <p className="text-center text-gray-600">Loading...</p>} */}

            {loading && <Spinner />}

            <div className="mt-8">
              {chats.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No chats present
                </div>
              ) : (
                chats.map((chat, index) => (
                  <div
                    key={index}
                    className={`flex justify-between py-2 px-3 cursor-pointer ${
                      selectedChatIndex === index
                        ? "bg-[rgba(49,170,176,0.16)]"
                        : "bg-gray-50"
                    }`}
                    onClick={() => handleChatClick(index)}
                  >
                    <div className="flex gap-2">
                      {chat?.tutorPhoto || chat?.studentPhoto ? (
                        <Image
                          src={
                            session.role === "student"
                              ? chat?.tutorPhoto
                              : chat?.studentPhoto
                          }
                          alt={
                            session.role === "student"
                              ? chat?.tutorName
                              : chat?.studentName
                          }
                          width={45}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-300 text-gray-700 rounded-full">
                          {session.role === "student"
                            ? chat?.tutorName?.charAt(0)?.toUpperCase()
                            : chat?.studentName?.charAt(0)?.toUpperCase()}
                        </div>
                      )}

                      <div>
                        <p className="text-[#252525] font-[poppins] not-italic">
                          {session.role === "student"
                            ? chat?.tutorName
                            : chat?.studentName}
                        </p>
                        <p className="text-[#454545] font-normal not-italic text-sm">
                          {chat?.latestMessage
                            ? `${chat.latestMessage.slice(
                                0,
                                Math.ceil(chat.latestMessage.length / 2)
                              )}...`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <p className="text-[#1A696B] font-[Poppins] font-medium">
                      {chat.latestMessageTime &&
                        new Date(chat?.latestMessageTime).toLocaleDateString(
                          [],
                          {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          }
                        )}
                    </p>
                  </div>
                ))
              )}
            </div>
            {!loading && chats.length === 0 && (
              <p className="text-center text-gray-600 mt-4">No results found</p>
            )}
          </div>
        )}

        {/* chat history for lg above */}
        <div className="bg-[#FFF] hidden lg:block w-[500px] h-[100vh] border-solid	border-[1px]  border-[rgba(0,0,0,0.05)] lg:rounded-[16px]	">
          <Link href="/find-tutor">
            <div className="bg-[rgba(30,141,143,0.44)] h-[40px] my-6 w-[40px] flex justify-center items-center rounded-[50%]">
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.152 5.4937H2.8437L6.91037 1.42704C7.23537 1.10204 7.23537 0.568703 6.91037 0.243703C6.83328 0.16645 6.7417 0.105161 6.64089 0.0633426C6.54008 0.0215248 6.43201 0 6.32287 0C6.21373 0 6.10566 0.0215248 6.00485 0.0633426C5.90404 0.105161 5.81246 0.16645 5.73537 0.243703L0.243704 5.73537C0.166451 5.81246 0.105161 5.90404 0.063343 6.00485C0.0215252 6.10566 0 6.21373 0 6.32287C0 6.43201 0.0215252 6.54008 0.063343 6.64089C0.105161 6.7417 0.166451 6.83328 0.243704 6.91037L5.73537 12.402C5.81252 12.4792 5.90411 12.5404 6.00492 12.5821C6.10572 12.6239 6.21376 12.6454 6.32287 12.6454C6.43198 12.6454 6.54002 12.6239 6.64082 12.5821C6.74163 12.5404 6.83322 12.4792 6.91037 12.402C6.98752 12.3249 7.04872 12.2333 7.09048 12.1325C7.13223 12.0317 7.15372 11.9236 7.15372 11.8145C7.15372 11.7054 7.13223 11.5974 7.09048 11.4966C7.04872 11.3958 6.98752 11.3042 6.91037 11.227L2.8437 7.16037H12.152C12.6104 7.16037 12.9854 6.78537 12.9854 6.32704C12.9854 5.8687 12.6104 5.4937 12.152 5.4937Z"
                  fill="black"
                />
              </svg>
            </div>
          </Link>

          <div className="flex justify-center px-4	">
            <div className="flex items-center w-[90%]   bg-[#F6F6F6] p-2  border-[1px] border-solid	 border-[rgba(0,0,0,0.05)] shadow-md rounded-lg	">
              <input
                type="text"
                placeholder="Search by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="outline-none bg-transparent font-normal  pl-1 not-italic	text-[#888]  placeholder-gray-400 w-full"
              />
              <div className="pr-4">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.9875 12.8721C10.8643 13.7695 9.44013 14.2028 8.00744 14.083C6.57475 13.9631 5.24232 13.2992 4.28382 12.2277C3.32532 11.1561 2.81351 9.75822 2.8535 8.32109C2.89349 6.88395 3.48224 5.51667 4.49884 4.50007C5.51545 3.48346 6.88273 2.89471 8.31986 2.85472C9.757 2.81473 11.1549 3.32654 12.2265 4.28504C13.298 5.24354 13.9619 6.57597 14.0817 8.00866C14.2016 9.44135 13.7683 10.8656 12.8709 11.9888L17.1675 16.2846C17.2289 16.3418 17.2782 16.4108 17.3123 16.4875C17.3465 16.5641 17.3649 16.6469 17.3664 16.7308C17.3678 16.8147 17.3524 16.8981 17.321 16.9759C17.2895 17.0537 17.2427 17.1244 17.1834 17.1838C17.124 17.2431 17.0534 17.2899 16.9755 17.3214C16.8977 17.3528 16.8143 17.3682 16.7304 17.3667C16.6465 17.3653 16.5637 17.3469 16.4871 17.3127C16.4104 17.2786 16.3414 17.2293 16.2842 17.1679L11.9875 12.8721ZM5.38253 11.5704C4.7709 10.9587 4.35433 10.1794 4.18546 9.33106C4.01659 8.48268 4.10301 7.60328 4.43379 6.804C4.76457 6.00472 5.32487 5.32144 6.04388 4.8405C6.76288 4.35957 7.60832 4.10257 8.47334 4.10199C9.33836 4.10141 10.1841 4.35727 10.9038 4.83723C11.6234 5.3172 12.1847 5.99973 12.5165 6.79856C12.8484 7.5974 12.936 8.47668 12.7683 9.32529C12.6005 10.1739 12.185 10.9537 11.5742 11.5663L11.57 11.5704L11.5659 11.5738C10.7451 12.3926 9.63289 12.8522 8.47351 12.8516C7.31413 12.8509 6.2024 12.3902 5.38253 11.5704Z"
                    fill="#4F4F4F"
                  />
                </svg>
              </div>
            </div>
          </div>
          {/* Display loading spinner */}
          {loading && <Spinner />}

          <div className="mt-8   ">
            {chats?.map((chat, index) => (
              <div
                key={index}
                className={`flex justify-between py-2 px-3 cursor-pointer ${
                  selectedChatIndex === index
                    ? "bg-[rgba(49,170,176,0.16)]"
                    : "bg-gray-50"
                }`}
                onClick={() => handleChatClick(index)} // Set active chat
                // onClick={() => handleR}
              >
                <div className={`flex gap-2  `}>
                  {/* Display participant's picture */}
                  {/* <Image
                  src={
                    session.role === "student"
                      ? chat?.tutorPhoto
                      : chat?.studentPhoto || "/images/default-avatar.png"
                  }
                  alt={
                    session.role === "student"
                      ? chat?.tutorName
                      : chat?.studentName
                  }
                  width={45}
                  height={40}
                /> */}

                  {chat?.tutorPhoto || chat?.studentPhoto ? (
                    <Image
                      src={
                        session.role === "student"
                          ? chat?.tutorPhoto
                          : chat?.studentPhoto
                      }
                      alt={
                        session?.role === "student"
                          ? chat?.tutorName
                          : chat?.studentName
                      }
                      width={45}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-300 text-gray-700 rounded-full">
                      {session.role === "student"
                        ? chat?.tutorName?.charAt(0)?.toUpperCase()
                        : chat?.studentName?.charAt(0)?.toUpperCase()}
                    </div>
                  )}

                  <div>
                    {/* Display participant's name */}
                    <p className="text-[#252525] fo] not-italic">
                      {session.role === "student"
                        ? chat?.tutorName
                        : chat?.studentName}
                    </p>

                    <p className="text-[#454545] font-normal not-italic text-sm">
                      {chat?.latestMessage
                        ? `${chat.latestMessage.slice(
                            0,
                            Math.ceil(chat.latestMessage.length / 2)
                          )}...`
                        : ""}
                    </p>
                  </div>
                </div>

                {/* Display latest message time */}
                <p className="text-[#1A696B] f] font-medium">
                  {chat?.latestMessageTime &&
                    new Date(chat?.latestMessageTime).toLocaleDateString([], {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                </p>
              </div>
            ))}
          </div>
          {/* Display "No Results Found" if chats array is empty */}
          {!loading && chats.length === 0 && (
            <p className="text-center text-gray-600 mt-4">No results found</p>
          )}
        </div>

        {/* chat history for md less */}
        {smallScreens && (
          <div className="bg-[#FFF]    w-[100%]  lg:p-5 border-solid border-[1px]  border-[rgba(0,0,0,0.05)] rounded-[16px]">
            <div className="flex flex-col justify-between h-full">
              {selectedChatIndex !== null ? (
                <div>
                  {/* for default to md */}
                  <div className="  flex justify-between lg:hidden  ">
                    <div className="flex items-center gap-[100px] justify-center sm:gap-[200px]  ">
                      <div
                        onClick={handleBack}
                        className="bg-[rgba(30,141,143,0.44)] h-[40px]   it  lg:hidden my-6 w-[40px] flex justify-center 
                       items-center rounded-[50%]"
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 13 13"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="flex items-start"
                        >
                          <path
                            d="M12.152 5.4937H2.8437L6.91037 1.42704C7.23537 1.10204 7.23537 0.568703 6.91037 0.243703C6.83328 0.16645 6.7417 0.105161 6.64089 0.0633426C6.54008 0.0215248 6.43201 0 6.32287 0C6.21373 0 6.10566 0.0215248 6.00485 0.0633426C5.90404 0.105161 5.81246 0.16645 5.73537 0.243703L0.243704 5.73537C0.166451 5.81246 0.105161 5.90404 0.063343 6.00485C0.0215252 6.10566 0 6.21373 0 6.32287C0 6.43201 0.0215252 6.54008 0.063343 6.64089C0.105161 6.7417 0.166451 6.83328 0.243704 6.91037L5.73537 12.402C5.81252 12.4792 5.90411 12.5404 6.00492 12.5821C6.10572 12.6239 6.21376 12.6454 6.32287 12.6454C6.43198 12.6454 6.54002 12.6239 6.64082 12.5821C6.74163 12.5404 6.83322 12.4792 6.91037 12.402C6.98752 12.3249 7.04872 12.2333 7.09048 12.1325C7.13223 12.0317 7.15372 11.9236 7.15372 11.8145C7.15372 11.7054 7.13223 11.5974 7.09048 11.4966C7.04872 11.3958 6.98752 11.3042 6.91037 11.227L2.8437 7.16037H12.152C12.6104 7.16037 12.9854 6.78537 12.9854 6.32704C12.9854 5.8687 12.6104 5.4937 12.152 5.4937Z"
                            fill="black"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center gap-2 ">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="5" cy="5" r="5" fill="#26A6A6" />
                        </svg>
                        <h1 className="text-[#1E8D8F]">
                          {session?.role === "student"
                            ? chats[selectedChatIndex]?.tutorName
                            : chats[selectedChatIndex]?.studentName}
                        </h1>
                      </div>
                    </div>
                    {/* Profile and Request Session Actions */}
                    <div className=" gap-3 hidden lg:block">
                      <button className="text-[#E77B3E] text-[poppins] px-0  lg:px-6 border-[1px] py-1 rounded-lg border-primary-400 font-semibold">
                        View Profile
                      </button>
                      <button className="bg-[#E77B3E] rounded-md lg:rounded-lg   lg:px-6 lg:py-1 text-[poppins] text-[#FFF] font-light  lg:font-semibold">
                        Request a Session
                      </button>
                    </div>
                  </div>

                  <div className=" hidden lg:flex justify-between">
                    <div className="flex items-center   lg:gap-3">
                      <div
                        onClick={handleBack}
                        className="bg-[rgba(30,141,143,0.44)] h-[40px]  lg:hidden my-6 w-[40px] flex justify-center 
                       items-center rounded-[50%]"
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 13 13"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12.152 5.4937H2.8437L6.91037 1.42704C7.23537 1.10204 7.23537 0.568703 6.91037 0.243703C6.83328 0.16645 6.7417 0.105161 6.64089 0.0633426C6.54008 0.0215248 6.43201 0 6.32287 0C6.21373 0 6.10566 0.0215248 6.00485 0.0633426C5.90404 0.105161 5.81246 0.16645 5.73537 0.243703L0.243704 5.73537C0.166451 5.81246 0.105161 5.90404 0.063343 6.00485C0.0215252 6.10566 0 6.21373 0 6.32287C0 6.43201 0.0215252 6.54008 0.063343 6.64089C0.105161 6.7417 0.166451 6.83328 0.243704 6.91037L5.73537 12.402C5.81252 12.4792 5.90411 12.5404 6.00492 12.5821C6.10572 12.6239 6.21376 12.6454 6.32287 12.6454C6.43198 12.6454 6.54002 12.6239 6.64082 12.5821C6.74163 12.5404 6.83322 12.4792 6.91037 12.402C6.98752 12.3249 7.04872 12.2333 7.09048 12.1325C7.13223 12.0317 7.15372 11.9236 7.15372 11.8145C7.15372 11.7054 7.13223 11.5974 7.09048 11.4966C7.04872 11.3958 6.98752 11.3042 6.91037 11.227L2.8437 7.16037H12.152C12.6104 7.16037 12.9854 6.78537 12.9854 6.32704C12.9854 5.8687 12.6104 5.4937 12.152 5.4937Z"
                            fill="black"
                          />
                        </svg>
                      </div>

                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="5" cy="5" r="5" fill="#26A6A6" />
                      </svg>
                      <h1 className="text-[#1E8D8F]">
                        {session?.role === "student"
                          ? chats[selectedChatIndex]?.tutorName
                          : chats[selectedChatIndex]?.studentName}
                      </h1>
                    </div>
                    {/* Profile and Request Session Actions */}
                    <div className=" gap-3 hidden lg:block">
                      <button className="text-[#E77B3E] text-[poppins] px-0  lg:px-6 border-[1px] py-1 rounded-lg border-primary-400 font-semibold">
                        View Profile
                      </button>
                      <button className="bg-[#E77B3E] rounded-md lg:rounded-lg   lg:px-6 lg:py-1 text-[poppins] text-[#FFF] font-light  lg:font-semibold">
                        Request a Session
                      </button>
                    </div>
                  </div>

                  <div
                    ref={displayRef}
                    className="display-container relative h-[80vh] max-h-[800px] flex flex-col custom-scrollbar overflow-y-auto"
                  >
                    {/* Show loading spinner while fetching messages */}
                    {loadingMessages ? (
                      <div className="p-5">
                        <Shimmer />
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-1">
                        {backendmessage?.length !== 0 &&
                          backendmessage?.map((messageObj, index) => {
                            const isCurrentUser =
                              messageObj.sender === session?.id;
                            const messageTime = new Date(
                              messageObj.timestamp
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            });

                            const currentDate = new Date(messageObj.timestamp);
                            const previousDate =
                              index > 0
                                ? new Date(backendmessage[index - 1].timestamp)
                                : null;

                            const showDateLabel =
                              !previousDate ||
                              getDateLabel(currentDate) !==
                                getDateLabel(previousDate);

                            const chat = chats.find(
                              (chatItem) =>
                                chatItem?.studentId === messageObj.sender ||
                                chatItem?.tutorId === messageObj.sender
                            );
                            const senderName =
                              chat?.studentId === messageObj.sender
                                ? chat.studentName
                                : chat?.tutorId === messageObj.sender
                                ? chat.tutorName
                                : "Unknown";
                            const senderInitial = senderName
                              ?.charAt(0)
                              ?.toUpperCase();

                            return (
                              <div key={index}>
                                {showDateLabel && (
                                  <div className="text-center lg:my-2 lg:text-sm text-gray-500">
                                    {getDateLabel(currentDate)}
                                  </div>
                                )}
                                <div
                                  className={`flex ${
                                    isCurrentUser
                                      ? "justify-end"
                                      : "justify-start"
                                  } items-center gap-3`}
                                >
                                  {!isCurrentUser && (
                                    <div className=" w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center bg-gray-300 text-[10px] lg:text-sm text-gray-700 rounded-full">
                                      {senderInitial}
                                    </div>
                                  )}
                                  <div
                                    className={`relative max-w-[75%] text-sm p-4 my-2 rounded-lg ${
                                      isCurrentUser
                                        ? "bg-[#F1FCFA] rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-none shadow-lg"
                                        : "bg-[rgba(251,233,217,0.46)] rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-none shadow-lg"
                                    }`}
                                  >
                                    <p className="pr-12 break-words overflow-wrap break-word ">
                                      {messageObj.message}
                                    </p>

                                    <span className="absolute bottom-1 right-2 text-[8px] lg:text-[10px] text-gray-500">
                                      {messageTime}
                                    </span>
                                  </div>
                                  {isCurrentUser && (
                                    <div className=" w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center bg-gray-300 text-[10px] lg:text-sm text-gray-700 rounded-full">
                                      {senderInitial}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {showScrollToBottomButton && (
                    <button
                      className="absolute bottom-[60px] lg:bottom-[220px] right-[20px] lg:right-[280px] bg-transparent text-black p-3 rounded-sm "
                      onClick={() => {
                        if (messagesContainerRef?.current) {
                          messagesContainerRef?.current?.scrollTo({
                            top: messagesContainerRef?.current?.scrollHeight,
                            behavior: "smooth",
                          });
                          setIsAtBottom(true);
                          setShowScrollToBottomButton(false);
                        }
                      }}
                    >
                      ⬇️
                    </button>
                  )}

                  {/* Input Box */}
                  <div className="flex items-center  mt-2 p-2 rounded-lg border border-gray-300 shadow-sm">
                    <input
                      type="text"
                      placeholder="Send a message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full"
                    />
                    <button
                      onClick={sendMessage}
                      className="bg-[#E77B3E] p-2 w-24 text-white rounded-lg ml-3"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Select a chat to start messaging
                </div>
              )}
            </div>
          </div>
        )}

        {/* chat details for lg above */}
        {!smallScreens && (
          <div className="bg-[#FFF] hidden  lg:block   w-[100%]  lg:p-5 border-solid border-[1px]  border-[rgba(0,0,0,0.05)] rounded-[16px]">
            <div className="flex flex-col justify-between h-full">
              {selectedChatIndex !== null ? (
                <div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-0 lg:gap-3">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="5" cy="5" r="5" fill="#26A6A6" />
                      </svg>
                      <h1 className="text-[#1E8D8F]">
                        {session?.role === "student"
                          ? chats[selectedChatIndex]?.tutorName
                          : chats[selectedChatIndex]?.studentName}
                      </h1>
                    </div>
                    {/* Profile and Request Session Actions */}
                    <div className="  hidden lg:block">
                      <button
                        onClick={() =>
                          handleViewTutor(chats[selectedChatIndex]?.tutorId)
                        }
                        className="text-[#E77B3E] text-[poppins] px-0  lg:px-6 border-[1px] py-1 rounded-lg border-primary-400 font-semibold"
                      >
                        View Profile
                      </button>
                      {viewTutor && (
                        <div
                          className="fixed inset-0 right-10 w-full bg-black bg-opacity-50 z-50 flex items-center justify-center pt-10"
                          onClick={() => setViewTutor(null)}
                        >
                          <div
                            className=""
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ViewTutor
                              viewTutor={viewTutor}
                              setViewTutor={setViewTutor}
                            />
                          </div>
                        </div>
                      )}
                      <button
                        className="bg-[#E77B3E] rounded-md lg:rounded-lg  mx-2  lg:px-6 lg:py-1 text-[poppins] text-[#FFF] font-light  lg:font-semibold"
                        onClick={() =>
                          handleRequestSession(
                            chats[selectedChatIndex]?.tutorId
                          )
                        }
                      >
                        Request a Session
                      </button>

                      {requestSessionId && (
                        <div
                          className="fixed inset-0 right-10 w-full bg-black bg-opacity-50 z-50 flex items-center justify-center pt-10"
                          onClick={() => setRequestSessionId(null)}
                        >
                          <div
                            className=""
                            onClick={(e) => e.stopPropagation()}
                          >
                            <RequestSession
                              tutorId={requestSessionId}
                              setShowModal={() => setRequestSessionId(null)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    ref={displayRef}
                    className="display-container relative h-[80vh] max-h-[800px] flex flex-col custom-scrollbar overflow-y-auto"
                  >
                    {/* Show loading spinner while fetching messages */}
                    {loadingMessages ? (
                      <div className="p-5">
                        <Shimmer />
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-1">
                        {backendmessage?.length !== 0 &&
                          backendmessage?.map((messageObj, index) => {
                            const isCurrentUser =
                              messageObj.sender === session?.id;
                            const messageTime = new Date(
                              messageObj?.timestamp
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            });

                            const currentDate = new Date(messageObj?.timestamp);
                            const previousDate =
                              index > 0
                                ? new Date(backendmessage[index - 1]?.timestamp)
                                : null;

                            const showDateLabel =
                              !previousDate ||
                              getDateLabel(currentDate) !==
                                getDateLabel(previousDate);

                            const chat = chats.find(
                              (chatItem) =>
                                chatItem?.studentId === messageObj?.sender ||
                                chatItem?.tutorId === messageObj?.sender
                            );
                            const senderName =
                              chat?.studentId === messageObj?.sender
                                ? chat?.studentName
                                : chat?.tutorId === messageObj?.sender
                                ? chat?.tutorName
                                : "Unknown";
                            const senderInitial = senderName
                              ?.charAt(0)
                              ?.toUpperCase();

                            return (
                              <div key={index}>
                                {showDateLabel && (
                                  <div className="text-center lg:my-2 lg:text-sm text-gray-500">
                                    {getDateLabel(currentDate)}
                                  </div>
                                )}
                                <div
                                  className={`flex ${
                                    isCurrentUser
                                      ? "justify-end"
                                      : "justify-start"
                                  } items-center gap-3`}
                                >
                                  {!isCurrentUser && (
                                    <div className=" w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center bg-gray-300 text-[10px] lg:text-sm text-gray-700 rounded-full">
                                      {senderInitial}
                                    </div>
                                  )}
                                  <div
                                    className={`relative max-w-[75%] text-sm p-4 my-2 rounded-lg ${
                                      isCurrentUser
                                        ? "bg-[#F1FCFA] rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-none shadow-lg"
                                        : "bg-[rgba(251,233,217,0.46)] rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-none shadow-lg"
                                    }`}
                                  >
                                    <p className="pr-12 ">
                                      {messageObj?.message}
                                    </p>

                                    <span className="absolute bottom-1 right-2 text-[8px] lg:text-[10px] text-gray-500">
                                      {messageTime}
                                    </span>
                                  </div>
                                  {isCurrentUser && (
                                    <div className=" w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center bg-gray-300 text-[10px] lg:text-sm text-gray-700 rounded-full">
                                      {senderInitial}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {showScrollToBottomButton && (
                    <button
                      className="absolute bottom-[60px] lg:bottom-[220px] right-[20px] lg:right-[280px] bg-transparent text-black p-3 rounded-sm "
                      onClick={() => {
                        if (messagesContainerRef?.current) {
                          messagesContainerRef?.current?.scrollTo({
                            top: messagesContainerRef?.current?.scrollHeight,
                            behavior: "smooth",
                          });
                          setIsAtBottom(true);
                          setShowScrollToBottomButton(false);
                        }
                      }}
                    >
                      ⬇️
                    </button>
                  )}

                  {/* Input Box */}
                  <div className="flex items-center mt-2 p-2 rounded-lg border border-gray-300 shadow-sm">
                    <input
                      type="text"
                      placeholder="Send a message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault(); // Prevents the default Enter behavior (e.g., form submission)
                          sendMessage(); // Calls sendMessage function when Enter is pressed
                        }
                      }}
                      className="flex-grow mx-3 p-2 focus:outline-none"
                    />
                    <button
                      onClick={sendMessage} // Triggers sendMessage function when the button is clicked
                      className="bg-[#E77B3E] p-2 w-24 text-white rounded-lg ml-3"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Select a chat to start messaging
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
