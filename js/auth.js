function getCurrentUser() {

    let user = localStorage.getItem("currentUser");

    if (user == null) {
        return null;
    }

    return JSON.parse(user);
}