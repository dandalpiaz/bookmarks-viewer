document.addEventListener('DOMContentLoaded', function () {
    // Get the page parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const startPage = urlParams.get('page');

    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
        const bookmarksContainer = document.getElementById('bookmarksContainer');
        
        if (startPage) {
            // Search for the folder with the name matching startPage
            const startNode = findStartNode(bookmarkTreeNodes, startPage);
            if (startNode) {
                // If the folder is found, display bookmarks starting from that folder
                displayBookmarks([startNode], bookmarksContainer);
            } else {
                // If no matching folder is found, display a message
                bookmarksContainer.textContent = `Folder "${startPage}" not found.`;
            }
        } else {
            // If no page parameter is provided, display the full bookmark tree
            displayBookmarks(bookmarkTreeNodes, bookmarksContainer);
        }
    });

    // Function to search for a folder by name
    function findStartNode(nodes, targetName) {
        for (const node of nodes) {
            if (node.title === targetName) {
                return node;
            }
            if (node.children) {
                const result = findStartNode(node.children, targetName);
                if (result) return result;
            }
        }
        return null;
    }

    function displayBookmarks(nodes, container, level = 1) {
        nodes.forEach(node => {
            if (node.children && node.children.length > 0) {
                // Create heading for folder name
                const heading = document.createElement('h' + Math.min(level, 6));
                heading.textContent = node.title;
                container.appendChild(heading);

                // Check if the folder contains any bookmarks
                const hasBookmarks = node.children.some(child => child.url);

                if (hasBookmarks) {
                    // Create a <ul> for the bookmark links if there are any bookmarks
                    const ul = document.createElement('ul');
                    container.appendChild(ul);

                    // Add bookmark links
                    node.children.forEach(child => {
                        if (child.url) {
                            const li = document.createElement('li');
                            const link = document.createElement('a');
                            link.href = child.url;
                            link.textContent = child.title;
                            link.target = '_blank';

                            const favicon = document.createElement('img');
                            favicon.src = 'https://www.google.com/s2/favicons?sz=16&domain_url=' + child.url;
                            favicon.width = 16;
                            favicon.height = 16;

                            li.appendChild(favicon);
                            li.appendChild(link);
                            ul.appendChild(li);
                        }
                    });
                }

                // Recursively display nested folders (outside the current <ul>)
                displayBookmarks(node.children.filter(child => child.children), container, level + 1);
            }
        });
    }
});


// Wait for 10 milliseconds after the page has loaded
window.addEventListener('load', () => {
    setTimeout(() => {
        // Get all <ul> elements
        const uls = document.querySelectorAll('ul');
        
        uls.forEach(ul => {
            // Find the preceding <h2> element
            let prev = ul.previousElementSibling;
            
            // Ensure the previous sibling is an <h2>
            if (prev) {
                // Create a new <div> with class "section"
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'section';
                
                // Move the <h2> and <ul> into the new <div>
                ul.parentNode.insertBefore(sectionDiv, ul);
                sectionDiv.appendChild(prev);
                sectionDiv.appendChild(ul);
            }
        });

        // wrap all the section divs in a new div with class "sections"
        const sections = document.querySelectorAll('.section');
        const sectionsDiv = document.createElement('div');
        sectionsDiv.className = 'sections';
        sections.forEach(section => sectionsDiv.appendChild(section));
        document.body.appendChild(sectionsDiv);
        
    }, 10);
});