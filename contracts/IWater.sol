// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

interface IWater {
    event Withdrawn(
        address indexed caller,
        address indexed receiver,
        address indexed owner,
        uint256 assets,
        uint256 shares,
        uint256 timestamp,
        uint256 utilizationRate
    );

    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) external returns (uint256);
}