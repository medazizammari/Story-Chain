import React, { Component } from "react";
import Storychain from "./contracts/Storychain.json";
import getWeb3 from "./getWeb3";

import "./App.css";

var md5 = require("md5");

const newEmptyBook = {
  recordHash: "",
  authorName: "",
  title: "",
  email: "",
};

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
    storageValue: 0,
    newBook: newEmptyBook,
    fetchedBookHash: "",
    bookDetails: null,
    status: "",
  };

  componentDidMount = async () => {
    await this.initStorychain();
  };

  initStorychain = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Storychain.networks[networkId];
      const instance = new web3.eth.Contract(
        Storychain.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.

      this.setState({ web3, accounts, contract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  onNewFileChange = async (e) => {
    const b64Hash = await toBase64(e.target.files[0]);
    let recordHash = md5(b64Hash);
    this.setState((oldState) => ({
      ...oldState,
      newBook: {
        ...oldState.newBook,
        recordHash: recordHash,
      },
    }));
  };

  onFetchFileChange = async (e) => {
    const b64Hash = await toBase64(e.target.files[0]);
    let recordHash = md5(b64Hash);
    this.setState((oldState) => ({
      ...oldState,
      fetchedBookHash: recordHash,
    }));
  };

  // FINAL FUNCS

  submitNewBook = async (e) => {
    e.preventDefault();
    try {
      const { accounts, contract } = this.state;
      const { recordHash, authorName, title, email } = this.state.newBook;
      await contract.methods
        .authNewBook(recordHash, authorName, title, email)
        .send({ from: accounts[0], gas: 100000 });
      this.setState({ status: "DONE" });
    } catch (err) {
      console.log(err);
    }
  };

  fetchBook = async (e) => {
    e.preventDefault();
    const { accounts, contract } = this.state;

    const response = await contract.methods
      .getBookDetailFromHash(this.state.fetchedBookHash)
      .call();

    this.setState({
      bookDetails: { ...response },
    });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3., accounts, and contract...</div>;
    }

    return (
      <div className="App">
        <header id="header">
          <h1>Storychain</h1>
          <small>Track personal document using the Ethereum Blockchain</small>
        </header>

        <div id="formsContainer">
          {/* FORM FOR DOCS SUBMISSION */}
          <form>
            <div className="formTitle">Authorize your Document</div>
            <div>
              <label>
                File
                <small>
                  Only the hash of the document is retrieved to be stored; the
                  actual contents are never stored anywhere.
                </small>
              </label>
              <input type="file" onChange={this.onNewFileChange} />
            </div>
            <div>
              <label>
                Hash <small>The hash of the document</small>
              </label>
              <input
                type="text"
                readOnly
                value={this.state.newBook.recordHash}
              />
            </div>
            <div>
              <label>Author Name</label>
              <input
                type="text"
                onChange={(e) => {
                  let newAuthor = e.target.value;
                  this.setState((oldState) => ({
                    ...oldState,
                    newBook: {
                      ...oldState.newBook,
                      authorName: newAuthor,
                    },
                  }));
                }}
              />
            </div>
            <div>
              <label>Title</label>
              <input
                type="text"
                onChange={(e) => {
                  let newTitle = e.target.value;

                  this.setState((oldState) => ({
                    ...oldState,
                    newBook: {
                      ...oldState.newBook,
                      title: newTitle,
                    },
                  }));
                }}
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="text"
                onChange={(e) => {
                  let newEmail = e.target.value;

                  this.setState((oldState) => ({
                    ...oldState,
                    newBook: {
                      ...oldState.newBook,
                      email: newEmail,
                    },
                  }));
                }}
              />
            </div>
            <div>
              <button type="submit" onClick={this.submitNewBook}>
                Authorize it!
              </button>
            </div>
            <div>
              <label style={{ textAlign: "center" }}>{this.state.status}</label>
            </div>
          </form>

          {/* FORM FOR DOCS VERIFICATION */}
          <form>
            <div className="formTitle">
              Pick a document to display its details from the Blockchain
            </div>
            <div>
              <input type="file" onChange={this.onFetchFileChange} />
            </div>
            <div>
              <label>
                Hash <small>The hash of the document</small>
              </label>
              <input readOnly type="text" value={this.state.fetchedBookHash} />
            </div>
            <div>
              <button onClick={this.fetchBook}>
                Get Doc Details from Storychain
              </button>
            </div>

            {this.state.bookDetails && (
              <div id="details" className="docDetails">
                <ul>
                  <li>Author Name: {this.state.bookDetails.authorName} </li>
                  <li>Title: {this.state.bookDetails.title} </li>
                  <li>Email: {this.state.bookDetails.email} </li>
                </ul>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }
}

export default App;
