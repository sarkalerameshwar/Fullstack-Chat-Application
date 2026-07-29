import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const showChatOnMobile = Boolean(selectedUser);

  return (
    <div
      className={`bg-base-100 ${
        showChatOnMobile
          ? "h-screen"
          : "pt-16 h-[calc(100dvh-4rem)] lg:pt-0 lg:h-screen"
      }`}
    >
      <div className="h-full lg:flex lg:items-center lg:justify-center lg:bg-base-200 lg:pt-20 lg:px-4">
        <div className="flex h-full w-full flex-col bg-base-100 lg:max-w-[1500px] lg:rounded-2xl lg:border lg:border-base-300 lg:shadow-xl lg:h-[calc(100vh-6rem)]">
          <div className="flex min-h-0 flex-1 lg:overflow-hidden lg:rounded-2xl">
            {/* Mobile: full-screen chat list OR full-screen chat */}
            <div
              className={`min-h-0 ${
                showChatOnMobile
                  ? "hidden lg:flex lg:h-full lg:shrink-0"
                  : "flex h-full w-full flex-1 flex-col"
              }`}
            >
              <Sidebar />
            </div>

            <div
              className={`min-h-0 ${
                showChatOnMobile
                  ? "flex h-full w-full flex-1 flex-col"
                  : "hidden lg:flex lg:h-full lg:flex-1 lg:flex-col"
              }`}
            >
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
