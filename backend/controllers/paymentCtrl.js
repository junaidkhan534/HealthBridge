const Razorpay = require('razorpay');
const crypto = require('crypto');

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrderController = async (req, res) => {
    try {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error("Razorpay keys are not configured in the .env file.");
        }

        const options = {
            amount: req.body.amount * 100,
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        };
        const order = await instance.orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("!!! ERROR creating Razorpay order:", error);
        res.status(500).send({ success: false, message: 'Error creating order' });
    }
};

const paymentVerificationController = (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        res.status(200).send({ success: true, message: 'Payment successful' });
    } else {
        res.status(400).send({ success: false, message: 'Payment verification failed' });
    }
};

module.exports = { createOrderController, paymentVerificationController };