
// How to store token in the client side
// 1.Memory  > ok typeof
// 2.Local Storage > ok type (xss)
// 3.Cookies http onplay

/*
-> for development purpose secure: false
-> cors()
app.use(cors({
    origin: ['http://localhost:5174'], // Adjust this to your client URL it must diffent from server URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));


-> client side with axios setting
       - in axios with credentials: true
*/
