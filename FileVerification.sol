// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FileVerification {
    struct FileRecord {
        string cid;
        string signature;
        address owner;
        uint256 timestamp;
    }

    mapping(bytes32 => FileRecord) public files;
    bytes32[] private storedFileHashes;

    event FileStored(
        bytes32 indexed fileHash,
        string cid,
        address indexed owner,
        uint256 timestamp,
        string signature
    );

    function storeFile(bytes32 fileHash, string memory cid, string memory signature) public {
        require(fileHash != bytes32(0), "Invalid hash");
        require(files[fileHash].timestamp == 0, "File already stored");

        files[fileHash] = FileRecord(cid, signature, msg.sender, block.timestamp);
        storedFileHashes.push(fileHash);

        emit FileStored(fileHash, cid, msg.sender, block.timestamp, signature);
    }

    function verifyFile(bytes32 fileHash)
        public
        view
        returns (
            bool exists,
            string memory cid,
            address owner,
            uint256 timestamp,
            string memory signature
        )
    {
        FileRecord memory record = files[fileHash];
        if (record.timestamp == 0) {
            return (false, "", address(0), 0, "");
        }
        return (true, record.cid, record.owner, record.timestamp, record.signature);
    }

    function getAllFileHashes() public view returns (bytes32[] memory) {
        return storedFileHashes;
    }

    function getTotalFiles() public view returns (uint256) {
        return storedFileHashes.length;
    }
}
