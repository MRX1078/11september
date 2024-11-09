
import AuthService from "../services/AuthService";

export default class Store {
    isAuth = false;
    isLoading = false;

    setAuth(bool:boolean){
        this.isAuth = bool;
    }

    setLoading(bool: boolean){
        this.isLoading = bool;
    }

    async login(username:string,password:string){
        this.setLoading(true);
        try {
            const response = await AuthService.login(username, password);
            localStorage.setItem('token', response.data.access_token);
            this.setAuth(true);
        } catch(e) {
            console.log('Error login', e);
        } finally {
            this.setLoading(false);
        }
    }
    async registration(username:string,password:string){
        try {
            const response = await AuthService.registration(username, password);
            localStorage.setItem('token', response.data.access_token);
            this.setAuth(true);
        } catch(e) {
            console.log('Error registration', e);
        }
    }
}