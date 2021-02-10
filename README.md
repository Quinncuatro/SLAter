# Christian SLAter
#### or: How I Learned to Stop Checking Emails and Still Meet SLA's

![Christian SLAter](https://i.imgur.com/UMtBPbB_d.jpg?maxwidth=400&shape=thumb&fidelity=high)

I'm a web developer who hates checking emails, but our service-level agreement says that I need to respond to helpdesk tickets in my queue within 45 minutes of them being assigned.

That's not GREAT, as having to shift focus from working on a project to checking my email for tickets takes time. It also takes time to fall back into a coding groove. 

I really hate checking emails... So I made SLAter to yell at me over a speaker system whenever I get a new ticket in my queue.

The best part is that this is really easy to set up, especially if your team is using DeskPro. Let's dive in:

### Materials:
- Raspberry Pi (I'm using a Pi 3 Model B)
- Micro USB Power Cable
- Ethernet Cable
- Speaker With 3.5 mm Jack
- An account with AWS (For Text-To-Speech Using Polly)
- Rad Picture of Christian Slater (Optional) 

### Setup:
1. Install Raspbian and Node.JS on your Pi. I used [this guide from W3 schools](https://www.w3schools.com/nodejs/nodejs_raspberrypi.asp).
2. Install MariaDB Server onto your pi using [this guide](https://howtoraspberrypi.com/mariadb-raspbian-raspberry-pi/) and then run `mysql-secure-installation` to get it configured.
3. Create a `slater` database with a `ticket_log` table using [this gist](https://gist.github.com/Quinncuatro/2b019b3068f76c489d6eb80a4f44c020).
4. Then, create a MySQL user named `slater` that has read/write access to the above database/table.
3. Git clone [this project](https://github.com/Quinncuatro/SLAter.git) anywhere on your Pi. I used the /home/pi/ directory.
4. Change directory (`cd`) into SLAter.
5. Run the npm installer (`npm install`) to install required packages locally.
6. Fill `sample.env` with the values related to your local MySQL database, your DeskPro API, and AWS account then change the file from `sample.env` to `.env`.
7. In `index.js` change the agent (tech) ID in three spots: in the API call within getTicketsFromAPI(), in the db.queryAsync query in getTicketsFromDB(), and in the db.queryAsync query in writeTicketToDB().

### Run:
1. In a tmux session (so you can close the SSH connection without upsetting Node) run `node index.js`. SLAter should tell you that he's online and then check for new tickets every 60 seconds.
