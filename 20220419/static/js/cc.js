function isEmailValid(email){
    eReg = /^[a-z0-9]+([._-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
    return eReg.test(email);
}

function isUsernameValid(uname){
    uReg = /^[a-zA-Z0-9_-]{1,16}$/;
    return uReg.test(uname);
}

function isPasswdValid(passwd){
    pReg = /^[a-zA-Z0-9`-~!@#$%^&*()_+<>?:"{},.\/\\;'[\]]{8,25}$/;
    return pReg.test(passwd);
}