#!/bin/bash
# WYA!? - Add SSH Key to Server
# Run this script on the server to add your SSH public key

PUBLIC_KEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICd3UPOZ6zEfGogSbDUGVyzkff45KAwNNcFhjDjNEnmK wya-alpha"

mkdir -p ~/.ssh
echo "$PUBLIC_KEY" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

echo "SSH key added successfully!"
echo "You can now SSH to this server without a password."

