<div id="top"></div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Vitality-Robotics-Inc/vitality-tools#getting-started">
    <img src="logo.png" alt="Logo">
  </a>

<h3 align="center">Vitality Tools</h3>

  <p align="center">
    This repo contains the serverless slackbot for vitality
    <br />
    <a href="#"><strong>Explore the docs »</strong></a>
    <br />
  </p>
</div>



 


<!-- TABLE OF CONTENTS -->
## Table of Contents
<details>
  <summary>Display Contents</summary>
  <hr>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#codebase-structure">Codebase Structure</a></li>
    <li><a href="#installation-and-usage">Installation</a></li>
    <ul>
        <li><a href="#labeling-tool">Labeling Tools</a></li>
        <li><a href="#tutorials-&-examples">Tutorials & Examples</a></li>
    </ul>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project
This repo holds the code for launching the application running the VR slack bot

If you are fighting with DS_Stores, run this in your terminal and kill them all forever! 
```defaults write com.apple.desktopservices DSDontWriteNetworkStores true```

<br />
<br />

<!-- codebase-structure -->
## ✨ Codebase structure

The project has a simple structure, represented as below:

```bash
< PROJECT ROOT >
    |--- .github/workflows/actions/
    |-- docs/
        |--- index.html
    |-- static/
        |--- css/
        |--- images/
        |--- js/
    |-- templates/
        |--- index.html
        |--- etc.html
    |-- tests/
        |--- etc.html
    |-- requirements.txt
    |-- zappa_settings.json
    |-- app.py
    |-- readme.md
    
```
<br />


<!-- Installation and Usage-->
## Installation And Usage
To run this app, create a virtual environment:
```
pip install virtualenv
virtualenv env
```

Activate your env
```
source env/bin/activate

#windows
env/scripts/activate.sh
```

INstall packages in the env
```
pip install -r requirements.txt
```

Once you have them installed, use zappa for interacting with the app 

```
zappa status dev
```

```

pip install slackclient python-dotenv flask aiohttp slackeventsapi


 # get the slack token and add it to .env

# curl -X POST -H 'Content-type: application/json' --data '{"text":"Hello, World!"}' https://hooks.slack.com/services/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
```
<!-- roadmap -->
## Roadmap
Here are the following items on our roadmap for this repo over the next quarter
* 

<!-- LICENSE -->
## License
All rights reserved. Fully Owned by Vitality Robotics. 

<!-- CONTACT -->
## Contact
Joe Webb - joe.webb@vitalityrobots.com

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

We would like to tip our hat to our contributors:
<a href = "https://github.com/Vitality-Robotics-Inc/vitality-tools/graphs/contributors">
  <img src = "https://contrib.rocks/image?repo = joelwebb/serverless-labeling-tool"/>
</a>

Made with [contributors-img](https://contrib.rocks).
<p align="right">(<a href="#top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/github_username/repo_name.svg?style=for-the-badge
