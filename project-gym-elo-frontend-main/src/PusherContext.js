// Note to grader: following discussion with Prof Tregubov please note that GPT was used
// in the making of this file. Specifically it helped us with redesigning the PusherProvider
// by adding proper user ID when someone logs in

import React, { createContext, useContext, useState, useEffect } from 'react';
import Pusher from 'pusher-js';

const PusherContext = createContext();

export const usePusher = () => useContext(PusherContext);

export const PusherProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    const pusher = new Pusher('50c9a69251810c14210a', {
      cluster: 'us2',
    });

    if (userId) {
      const newChannel = pusher.subscribe(userId);
      setChannel(newChannel);

      newChannel.bind('notif-event', (data) => {
        // Handle notification event
      });

      return () => {
        pusher.unsubscribe(userId);
      };
    }
  }, [userId]);

  const updateUserId = (newUserId) => {
    setUserId(newUserId);
  };

  return (
    <PusherContext.Provider value={{ channel, updateUserId }}>
      {children}
    </PusherContext.Provider>
  );
};

export const useUpdateUserId = () => {
  const { updateUserId } = useContext(PusherContext);
  return updateUserId;
};