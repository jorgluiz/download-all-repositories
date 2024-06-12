const express = require('express');
const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');
const app = express();
const port = 3000;

// Substitua pelo seu token do GitHub
const GITHUB_TOKEN = '';
const GITHUB_USERNAME = 'jorgluiz';

app.get('/download-repos', async (req, res) => {
  try {
    const repos = await getRepos();
    const downloadPromises = repos.map(repo => downloadRepo(repo));
    await Promise.all(downloadPromises);
    res.send('Repositórios baixados com sucesso!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao baixar os repositórios');
  }
});

const getRepos = async () => {
  const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;
  const response = await axios.get(url, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`
    }
  });
  return response.data.map(repo => repo.clone_url);
};

const downloadRepo = (repoUrl) => {
  return new Promise((resolve, reject) => {
    const repoName = repoUrl.split('/').pop().replace('.git', '');
    const command = `git clone ${repoUrl} repos/${repoName}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao clonar o repositório ${repoName}: ${error.message}`);
        return reject(error);
      }
      console.log(`Repositório ${repoName} clonado com sucesso`);
      resolve();
    });
  });
};

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
