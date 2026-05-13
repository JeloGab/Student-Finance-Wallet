const sendNotification = async (event, payload) => {
  const token = process.env.ESB_JWT_TOKEN
  const baseUrl = process.env.ESB_BASE_URL || 'https://esb-cjnx.onrender.com'

  if (!token) {
    console.warn(`[U-ANAS] ESB_JWT_TOKEN not set — skipping ${event} notification`)
    return
  }

  try {
    const response = await fetch(`${baseUrl}/api/esb/uanas/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      console.error(`[U-ANAS] ${event} notification failed — status ${response.status}`)
    } else {
      console.log(`[U-ANAS] ${event} notification sent successfully`)
    }
  } catch (err) {
    console.error(`[U-ANAS] ${event} notification error:`, err.message)
  }
}

module.exports = { sendNotification }
