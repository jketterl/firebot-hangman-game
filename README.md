# Hangman for Firebot

This is a userscript for the popular chat bot [Firebot](https://firebot.app/) implementing a basic game of hangman.

## Features:

* Randomly selects a word to guess from one of the available sources:
  * a dictionary file
  * the [Urban Dictionary](https://www.urbandictionary.com/)
* Displays the current game status in the Firebot overlay
* Currency integration for guess costs and win payouts
* Exports a number of bot events for further customizing with sounds, videos or graphics
* Exports an effect for starting the game from other events

## Requirements

* Firebot v5

## How to setup

* Download the file `dist/hangman.js` and place it in your Firebot user script directory.
* Add and enable the script on the Firebot settings page
* Activate and configure the Hangman game on the Firebot games page

## Chat commands

* Start a game with `!hangman start`
* Guess letters with `!guess x`
* Solve the game at any time with `!guess word`
* Stop the game at any time with `!hangman stop`
* Restart the game (with a new word to guess) with `hangman restart`

## TODO

* Implement Wordnik API