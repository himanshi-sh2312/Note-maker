import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import NotesContainer from './NotesContainer';
import { GlobalStyle, ButtonSpan } from './styles';
import { AptosWalletAdapter } from '@aptos-labs/wallet-adapter';
import { AptosClient, Network } from 'aptos'; // Import Aptos Client
import { useWallet } from '@aptos-labs/wallet-adapter-react'; // Import wallet context

const client = new AptosClient('https://testnet.aptoslabs.com'); // Set Aptos client for TESTNET

// Add module address and function info
const moduleAddress = "0xb63d417b49fea817f35580ef0b2c75203c77ea228cbfc4c505a417a52f866c1a"; // Replace with your actual module address
const functionName = "NotesManager::add_note"; // Function name to call

function App() {
  const themeState = useTheme();
  const initialState = JSON.parse(window.localStorage.getItem('notes')) || [
    {
      createdOn: new Date(),
      edit: true,
    },
  ];
  const [notes, setNotes] = useState(initialState);
  const [wallet, setWallet] = useState(null);
  const [address, setAddress] = useState('');
  
  const { connect, disconnect, account } = useWallet(); // Use Aptos wallet context
  
  useEffect(() => {
    window.localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // Wallet connection
  const connectWallet = async () => {
    try {
      await connect(); // Using wallet context to connect
      setAddress(account.address); // Set wallet address after successful connection
    } catch (error) {
      console.error('Wallet connection failed', error);
    }
  };

  const disconnectWallet = () => {
    disconnect(); // Use wallet context to disconnect
    setAddress('');
  };

  const addNoteOnChain = async () => {
    if (!account) {
      console.error('Wallet not connected');
      return;
    }

    try {
      const payload = {
        type: 'entry_function_payload',
        function: `${moduleAddress}::${functionName}`,
        arguments: [], // Specify arguments if any required by the function
        type_arguments: [], // Specify type arguments if any required
      };

      const response = await client.submitTransaction(account, payload); // Submit the transaction to Aptos blockchain
      await client.waitForTransaction(response); // Wait for transaction confirmation

      // Reload notes here if needed
      addNote();
    } catch (error) {
      console.error('Failed to add note on-chain', error);
    }
  };

  const initializeCollection = async () => {
    const payload = {
      type: 'entry_function_payload',
      function: '0xb63d417b49fea817f35580ef0b2c75203c77ea228cbfc4c505a417a52f866c1a::NotesManager::initialize_collection',
      arguments: [], // Empty arguments as the function requires the signer only
      type_arguments: [],
    };
  
    try {
      const response = await client.submitTransaction(account, payload);
      await client.waitForTransaction(response); // Wait for transaction confirmation
    } catch (error) {
      console.error('Failed to initialize collection', error);
    }
  };
  

  const addNote = () => {
    const tempNotes = [...notes];
    const result = { createdOn: new Date(), edit: true };
    tempNotes.push(result);
    setNotes(tempNotes);
  };

  const onDelete = (idx) => {
    const tempNotes = [...notes];
    tempNotes.splice(idx, 1);
    setNotes(tempNotes);
  };

  const createNotesContainer = () => {
    return notes.map((note, idx) => (
      <NotesContainer
        key={note.createdOn}
        note={note}
        idx={idx}
        onDelete={() => onDelete(idx)}
      />
    ));
  };

  return (
    <>
      <GlobalStyle />
      <div>
        <h1>
          React Markdown Note{' '}
          {themeState.dark ? (
            <ButtonSpan role="img" aria-label="sun" onClick={themeState.toggle}>
              🌞
            </ButtonSpan>
          ) : (
            <ButtonSpan role="img" aria-label="moon" onClick={themeState.toggle}>
              🌙
            </ButtonSpan>
          )}
        </h1>
        <div>
          {address ? (
            <div>
              <p>Connected wallet: {address}</p>
              <button onClick={disconnectWallet}>Disconnect Wallet</button>
            </div>
          ) : (
            <button onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
      </div>
      <button onClick={addNoteOnChain} type="button">
        Add New Note
      </button>
      <br />
      <br />
      {createNotesContainer()}
    </>
  );
}

export default App;
