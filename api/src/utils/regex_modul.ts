export async function buildRegEx(words: string[] = []){
    //const regexString = '/' + words.join('&') + '/gi'
    let regexString:String = ""

    words.forEach(element => {
        regexString += "(?=.*" + element + ")"
    });

    regexString = "/" + regexString + "/gi"
    return regexString
}