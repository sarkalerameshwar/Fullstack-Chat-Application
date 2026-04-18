import User from '../models/user.model.js';


export const searchUsers = async (req, res) => {
    
    try {
        const { query } = req.query;
        if(!query){
            return res.status(400).json({ message: "Query parameter is required" });
        }

        const regex = new RegExp(query, 'i'); // Case-insensitive search
        const users = await User.find({
            $or: [
                { username: regex },
                { email: regex }
            ]
        }).select('username email profile_Pic'); // Select only necessary fields
        if(users.length === 0){
            return res.status(404).json({ message: "No users found matching the query" });
        }

        return res.json(users);

    } catch (error) {
        return res.status(500).json({ message: "Error searching users", error });
    }

}