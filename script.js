const url = "https://reqres.in/api/users?page=2";
fetch(url)
    .then(res=>res.json())
    .then(res=>showData(res.data))
    .catch(err=>console.log(err))

function showData(user) {
    for (let i = 0; i < user.length; i++) {
    let usercard = document.createElement("div");
    usercard.className = "user-card";
    let button = document.createElement("button");
    let count = 0;
    button.textContent = "like";
    button.className = "like-button";
    button.addEventListener("click", function() {
        count++;
        if (count > 1000) {
            const str = count.toString();
            const formattedCount = str.slice(0, -3) + "K";
            button.textContent = ` 👍${formattedCount}`;
        }
        
        else {
            button.textContent = ` 👍${count}`;
        }
    });
    const container = document.getElementById("container");
    container.style.cssText = "; padding: 20px; border-radius: 10px; margin-bottom: 20px;";
    const image = document.createElement("img");
    image.src = user[i].avatar;
    usercard.appendChild(image);
    usercard.appendChild(button);
    const name = document.createElement("p");
    name.textContent = `${user[i].first_name} ${user[i].last_name}`;
    usercard.appendChild(name);
    const email = document.createElement("p");
    email.textContent = user[i].email;
    usercard.appendChild(email);
    container.appendChild(usercard);
}}
