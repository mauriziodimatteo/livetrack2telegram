// Emails should be sent to <you>+garminlivetrack@gmail.com
const RECIPIENT_SUFFIX = 'garminlivetrack'
const TELEGRAM_CHAT_ID = '<REPLACE_ME>'

/**
 * Get a list of email threads with unread messages from Garmin Live Track
 */
function getThreadsFromLiveTracking(){
  // get my email address
  let myAddress = Gmail.Users.getProfile('me').emailAddress
  
  // append suffix to my email address
  myAddress = myAddress.split('@')
  liveTrackRecipient = myAddress[0] + '+' + RECIPIENT_SUFFIX + '@' + myAddress[1]

  // build gmail search filter
  let search_filter = 'in:inbox is:unread to:(' + liveTrackRecipient + ')'
  // console.log(search_filter)

  // get list of filtered threads
  let threads = GmailApp.search(search_filter);
  // console.log(threads)
  
  return threads
 
}

/**
 * Extract Live Track URL from email's body
 */
function getLiveTrackURLFromBody(html_body){  
  url = html_body.match('https:\/\/livetrack.garmin.com[^"]+')[0]
  return url
}

/**
 * Send message with tracking url to a telegram channel
 */
function sendTelegramMessage(live_track_url, channel_id){
  
  let icons = ["🚴", "🚴‍♂️", "🚵", "👋", "🚀"]
  let icon = icons[Math.floor(Math.random()*icons.length)];

  const url = "https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage"
  const data = {
    'chat_id': channel_id,
    'text': icon + ' Hi, I am out on a ride! To follow me click here 👉🏻 [Garmin Live Track](' + live_track_url + ')',
    'parse_mode': 'markdown',
  };
  const options = {
    'method': 'post',
    'payload': data
  };
  const response = UrlFetchApp.fetch(url, options);
  console.log(response.getContentText())
}

function main(){
  // Get a list of threads with unread messages from Garmin Live Track
  threads = getThreadsFromLiveTracking()
  // console.log(threads)

  if(threads.length > 0){
    // Get body of most recent unread message from most recent thread
    messages =  threads[0].getMessages()
    body = messages[messages.length - 1].getBody()

    // Extract live track URL from HTML body
    track_url = getLiveTrackURLFromBody(body)
    console.log(track_url)

    // Send Telegram message 
    sendTelegramMessage(track_url, TELEGRAM_CHAT_ID)

    // Move all matching threads to trash
      for (i in threads){
        threads[i].markRead()
        threads[i].moveToTrash()
      }
  }
  else{
    console.log('No new messages')
  }    
}