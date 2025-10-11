import React, { createContext, useState, useContext, useEffect } from 'react';

const ParticipantContext = createContext();

export const useParticipant = () => {
  const context = useContext(ParticipantContext);
  if (!context) {
    throw new Error('useParticipant must be used within a ParticipantProvider');
  }
  return context;
};

export const ParticipantProvider = ({ children }) => {
  const [participant, setParticipant] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  console.log('🔵 ParticipantProvider initialized');

  // Load participant data from localStorage on mount
  useEffect(() => {
    console.log('🔄 Loading participant data from localStorage...');
    const storedParticipant = localStorage.getItem('participant');
    if (storedParticipant) {
      const participantData = JSON.parse(storedParticipant);
      setParticipant(participantData);
      setIsAuthenticated(true);
      console.log('✅ Participant data loaded from localStorage:', participantData);
      console.log('🆔 PARTICIPANT ID:', participantData.id);
    } else {
      console.log('ℹ️ No participant data found in localStorage');
    }
  }, []);

  // Log participant data whenever it changes
  useEffect(() => {
    console.log('📊 Participant state changed:');
    if (participant) {
      console.log('═══════════════════════════════════════════════');
      console.log('🆔 PARTICIPANT ID:', participant.id);
      console.log('═══════════════════════════════════════════════');
      console.log('Current Participant Data:', {
        id: participant.id,
        age: participant.age,
        gender: participant.gender,
        education: participant.education,
        city: participant.city,
        experimentsParticipated: participant.experimentsParticipated,
        createdAt: participant.createdAt,
        updatedAt: participant.updatedAt
      });
      console.log('Is Authenticated:', isAuthenticated);
      console.log('═══════════════════════════════════════════════');
    } else {
      console.log('No participant logged in');
    }
  }, [participant, isAuthenticated]);

  // Continuously log participant ID every 10 seconds when logged in
  useEffect(() => {
    if (participant?.id) {
      console.log('⏰ Starting continuous ID logging...');
      const intervalId = setInterval(() => {
        console.log('🔄 [CONTINUOUS LOG] Participant ID:', participant.id);
      }, 10000); // Log every 10 seconds

      return () => {
        console.log('⏰ Stopping continuous ID logging');
        clearInterval(intervalId);
      };
    }
  }, [participant]);

  const login = (participantData) => {
    console.log('🔐 Participant login called with data:', participantData);
    console.log('🆔 LOGGING IN WITH ID:', participantData.id);
    setParticipant(participantData);
    setIsAuthenticated(true);
    localStorage.setItem('participant', JSON.stringify(participantData));
    console.log('✅ Participant logged in and saved to localStorage');
    console.log('🆔 PARTICIPANT ID SAVED:', participantData.id);
  };

  const logout = () => {
    console.log('🚪 Participant logout called');
    if (participant?.id) {
      console.log('🆔 Logging out participant with ID:', participant.id);
    }
    setParticipant(null);
    setIsAuthenticated(false);
    localStorage.removeItem('participant');
    console.log('✅ Participant logged out and removed from localStorage');
  };

  const updateParticipant = (updatedData) => {
    console.log('🔄 Updating participant data with:', updatedData);
    const newData = { ...participant, ...updatedData };
    setParticipant(newData);
    localStorage.setItem('participant', JSON.stringify(newData));
    console.log('✅ Participant data updated:', newData);
    console.log('🆔 UPDATED PARTICIPANT ID:', newData.id);
  };

  const value = {
    participant,
    isAuthenticated,
    login,
    logout,
    updateParticipant
  };

  return (
    <ParticipantContext.Provider value={value}>
      {children}
    </ParticipantContext.Provider>
  );
};
