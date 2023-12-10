# CS410 Project - Team DAMDT - Fall 2023

## Final Submission

- Setup https://youtu.be/PRn2CEoyLtc
- Walkthrough https://youtu.be/JcK99AcLFAI

## Team Members

- David Anderson
- Andrew Chiang
- Mridul Ghanshala
- Dave Pankros
- Timothy Ling


## Project Summary

The free topic we chose centers around the Intelligent Browsing Theme. When
viewing a post on Campuswire, the user is unable to view other existing relevant posts.
This can make finding relevant posts tedious. Also, when the user is creating a post,
they are unable to see if a similar post already exists. This can lead to duplicate posts
being created. Duplicate posts mean duplicate replies or replies that simply refer to
another post.
Our project will create a Google chrome extension to make relevant documents
readily available via a sidebar. We plan on reading in the current post or the post being
written depending on cursor focus. Then we will generate query terms for the post by
using chatGPT or TF-IDF. We will then use these query terms to search for relevant
posts, either by leveraging the existing search in Campuswire or by using TF-IDF. We
will then populate the sidebar UI with the top x documents returned from the search. For
our implementation, we plan to use Javascript as our language of choice.


## List of Tasks

- Setup browser extension: Setup environment (10 hours)
- Data gathering: The current title and body or document being created
based on cursor focus. (20 hours)
- Query term generation - Use the data gathered to make a query to
chatGPT for the search terms. (30 hours)
- Find relevant docs - Use search terms, either by leveraging the existing
search from campuswire or by using TF-IDF. (20 hours)
- Create sidebar UI - Create ui and populate content from search results.
- Create settings page. (20 hours)


## Running the Chrome Extension

### Requirements

- Chrome web browser
- npm (Development Build)


### Development Build
```bash
#Git Checkout
git checkout git@github.com:dpankros/cs410_project.git
cd cs410_project

#Build command
npm i
npm run build

#Alternate command
npm run start
```
When you make a change, run `npm run build` again


### Automated Build

GitHub Actions are used to automatically build the extension. 


## Deploy

### From an Automated Release

1. Click on a version under the Releases heading on the right column of the homepage.
2. Click on "release.zip" under the Assets heading.
4. In Chrome, open your [extensions page](chrome://extensions/) and ensure "Developer mode" is on in the upper right corner.
5. Drag the release.zip file to your Chrome extensions page.
6. (Optional) Click on the "Details" button of the extension, and then the "Extension options" link.  Enter an OpenAI API Key and Organization then close this page.
1. Open a new tab in the browser and navigate to [Campuswire](https://www.campuswire.com)

_NOTE: Sometimes Chrome does not install the extension when dragged onto the extensions page.  If this happens to you, refresh the page and it should work properly._

### From Source

1. Checkout the source of this project
2. Run `npm i` then `npm start`.  A build folder will be created.
4. In Chrome, open your [extensions page](chrome://extensions/) and ensure "Developer mode" is on in the upper right corner.
1. Click "Load unpacked"
1. Select the build folder created, above.
2. (Optional) Click on the "Details" button of the extension, and then the "Extension options" link.  Enter an OpenAI API Key and Organization then close this page.
1. Open a new tab in the browser and navigate to [Campuswire](https://www.campuswire.com)

