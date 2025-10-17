import bcryptjs from 'bcryptjs';
import { envVars } from "../config/env";
import { AuthProvider, IAuthProvider, IUser, Role } from "../modules/user/user.interface";
import User from "../modules/user/user.model";

export const seedSuperAdmin = async () => {
    try {

        const isSuperAdminExists = await User.findOne({ email: envVars.SUPER_ADMIN_EMAIL });

        if (isSuperAdminExists) {
            console.log("👨‍💻 Super Admin Already Exists.");
            return;
        }

        console.log("📝 Trying to Create Super Admin...");

        const salt = await bcryptjs.genSalt(envVars.BCRYPT_SALT_ROUND);
        const hashedPassword = await bcryptjs.hash(envVars.SUPER_ADMIN_PASS, salt);
        const authProvider: IAuthProvider = { provider: AuthProvider.CREDENTIAL, providerId: envVars.SUPER_ADMIN_EMAIL as string };

        const payload: IUser = {
            name: "Super Admin",
            email: envVars.SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            role: Role.SUPER_ADMIN,
            isVerified: true,
            auths: [authProvider]
        };

        const superAdmin = await User.create(payload);

        console.log("✅ Super Admin Created Successfully!");
        console.log(superAdmin);

    } catch (error) {
        console.log(error);
    }
}