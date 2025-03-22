// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MusicPlatform is ERC721URIStorage, Ownable {
    struct Song {
        uint id;
        string ipfsHash;
        address artist;
        uint votes;
        uint funds;
    }

    struct Deal {
        uint songId;
        address recordLabel;
        uint ownership;
        uint revenueSplit;
        uint upfrontPayment;
        bool accepted;
    }
    struct DealInfo {
    uint dealId;
    uint songId;
    address recordLabel;
    uint ownership;
    uint revenueSplit;
    uint upfrontPayment;
    bool accepted;
}

    mapping(uint => Song) public songs;
    mapping(uint => Deal) public deals;
    mapping(uint => bool) public songHasDeal;

    uint public songCount;
    uint public dealCount;

    event SongUploaded(uint indexed songId, string ipfsHash, address artist);
    event SongVoted(uint indexed songId, uint amount, address voter);
    event DealProposed(uint indexed dealId, uint songId, address recordLabel);
    event DealAccepted(uint indexed dealId, uint nftId, address artist);
    event PaymentProcessed(uint indexed nftId, uint amount, address sender);

    constructor() ERC721("MusicDealNFT", "MDNFT") Ownable(msg.sender) {}

    function uploadSong(string memory _ipfsHash) public {
        songCount++;
        songs[songCount] = Song(songCount, _ipfsHash, msg.sender, 0, 0);
        emit SongUploaded(songCount, _ipfsHash, msg.sender);
    }

    function getSongs() public view returns (
        uint[] memory, 
        string[] memory, 
        address[] memory, 
        uint[] memory, 
        uint[] memory
    ) {
        uint[] memory ids = new uint[](songCount);
        string[] memory ipfsHashes = new string[](songCount);
        address[] memory artists = new address[](songCount);
        uint[] memory votes = new uint[](songCount);
        uint[] memory funds = new uint[](songCount);

        for (uint i = 1; i <= songCount; i++) {
            Song storage song = songs[i];
            ids[i - 1] = song.id;
            ipfsHashes[i - 1] = song.ipfsHash;
            artists[i - 1] = song.artist;
            votes[i - 1] = song.votes;
            funds[i - 1] = song.funds;
        }

        return (ids, ipfsHashes, artists, votes, funds);
    }

    function voteSong(uint _songId) public payable {
        require(msg.value > 0, "Must send ETH to vote");
        require(songs[_songId].id != 0, "Song does not exist");

        songs[_songId].votes++;
        songs[_songId].funds += msg.value;
        emit SongVoted(_songId, msg.value, msg.sender);
    }

    function proposeDeal(
        uint _songId,
        address _recordLabel,
        uint _ownership,
        uint _revenueSplit
    ) public payable {
        require(msg.value >0, "Send upfront payment");
        require(songs[_songId].id != 0, "Song does not exist");

        dealCount++;
        deals[dealCount] = Deal(_songId, _recordLabel, _ownership, _revenueSplit, msg.value, false);
        emit DealProposed(dealCount, _songId, _recordLabel);
    }

    function acceptDeal(uint _dealId, string memory _tokenURI) public {
        Deal storage deal = deals[_dealId];
        require(!deal.accepted, "Deal already accepted");
        require(songs[deal.songId].artist == msg.sender, "Only artist can accept deal");

        payable(msg.sender).transfer(deal.upfrontPayment);
        deal.accepted = true;

        uint nftId = _dealId;
        _mint(msg.sender, nftId);
        _setTokenURI(nftId, _tokenURI);

        songHasDeal[deal.songId] = true;
        emit DealAccepted(_dealId, nftId, msg.sender);
    }

    function payForLicense(uint _nftId) public payable {
        require(msg.value > 0, "Must send ETH");
        Deal memory deal = deals[_nftId];
        require(deal.accepted, "Deal is not active");

        uint artistShare = (msg.value * deal.revenueSplit) / 100;
        uint labelShare = msg.value - artistShare;

        payable(deal.recordLabel).transfer(labelShare);
        payable(ownerOf(_nftId)).transfer(artistShare);

        emit PaymentProcessed(_nftId, msg.value, msg.sender);
    }

    function getTopSongs() public view returns (uint[] memory) {
        uint[] memory topSongs = new uint[](songCount);
        for (uint i = 1; i <= songCount; i++) {
            topSongs[i - 1] = i;
        }
        return topSongs;
    }

    // Function to get all proposed deals for an artist's songs
   function getDealsForArtist(address _artist) public view returns (DealInfo[] memory) {
    uint count = 0;

    // Step 1: Count relevant deals
    for (uint i = 1; i <= dealCount; i++) {
        if (songs[deals[i].songId].artist == _artist) {
            count++;
        }
    }

    // Step 2: Allocate memory for return values
    DealInfo[] memory artistDeals = new DealInfo[](count);
    uint index = 0;

    for (uint i = 1; i <= dealCount; i++) {
        if (songs[deals[i].songId].artist == _artist) {
            artistDeals[index] = DealInfo({
                dealId: i,
                songId: deals[i].songId,
                recordLabel: deals[i].recordLabel,
                ownership: deals[i].ownership,
                revenueSplit: deals[i].revenueSplit,
                upfrontPayment: deals[i].upfrontPayment,
                accepted: deals[i].accepted
            });
            index++;
        }
    }

    return artistDeals;
}

function getAcceptedDeals() public view returns (DealInfo[] memory) {
    uint count = 0;

    for (uint i = 1; i <= dealCount; i++) {
        if (deals[i].accepted) {
            count++;
        }
    }

    DealInfo[] memory acceptedDeals = new DealInfo[](count);
    uint index = 0;

    for (uint i = 1; i <= dealCount; i++) {
        if (deals[i].accepted) {
            acceptedDeals[index] = DealInfo({
                dealId: i,
                songId: deals[i].songId,
                recordLabel: deals[i].recordLabel,
                ownership: deals[i].ownership,
                revenueSplit: deals[i].revenueSplit,
                upfrontPayment: deals[i].upfrontPayment,
                accepted: deals[i].accepted
            });
            index++;
        }
    }

    return acceptedDeals;
}



}
