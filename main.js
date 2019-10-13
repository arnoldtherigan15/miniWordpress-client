let app = new Vue ({
    el:'#app',
    data:{
        isLogin:true,
        usernameReg:'',
        emailReg:'',
        passwordReg:'',
        emailLogin:'',
        passwordLogin:'',
        isRead:false,
        isError:false,
        errTemp : '',
        errTrig:'',
        title:'',
        content:'',
        articleData:'',
        idTemp:'',
        isUpdate:false,
        afterLogin:false,
        isHome: false,
        isWrite: false,
        username: '',
        email:'',
        filter:'',
        isReadAll: false,
        isSuccess : false,
        author :'',
        authorAll : '',
        articleDataAll : '',
        formUploadImg:{
            img:''
        }
    },
    methods: {
        login(){
            axios({
                method:'post',
                url:'http://localhost:3000/user/login',
                data: {email:this.emailLogin,password:this.passwordLogin}
            })
            .then(({data})=>{
                localStorage.setItem('token',data.token)
                this.username = data.username
                this.email = data.email
                this.readAll()
                this.read()
                this.emailLogin = ''
                this.passwordLogin = ''
                this.isLogin = false
                this.isHome = true
                this.afterLogin = true
                this.isError = false
            })
            .catch(err=>{
                err = JSON.parse(err.response.request.response).message[0]
                this.isError = true
                this.errTemp = err
                swal('Error', `${this.errTemp}`, "error")
                
            })
        },
        register(){
            axios({
                method:'post',
                url:'http://localhost:3000/user/register',
                data: {email:this.emailReg,username:this.usernameReg,password:this.passwordReg}
            })
            .then(({data})=>{             
                localStorage.setItem('token',data.token)
                this.readAll()
                this.read()
                this.username = data.username
                this.email = data.email
                this.emailReg = ''
                this.passwordReg = ''
                this.username = ''
                this.isLogin = false
                this.afterLogin = true
                this.isHome = true
                this.isError = false
                
            })
            .catch(err=>{
                err = JSON.parse(err.response.request.response).message[0]
                this.isError = true
                this.errTemp = err
                swal('Error', `${this.errTemp}`, "error")
            })
        },
        logout(){
            localStorage.removeItem('token')
            this.isLogin = true
            this.afterLogin = false
            this.isHome = false
        },
        sendingEvent(file,formData){
            formData.append('image',file)
        },
        previewFile(event){
            this.formUploadImg.img = event.target.files[0]
        },
        postArticle() {
            let {img} = this.formUploadImg
            let bodyFormData = new FormData()
            bodyFormData.append('image',img)
            
            axios({
                method:'post',
                url:'http://localhost:3000/article/upload',
                headers:{
                    token:localStorage.getItem('token')
                },
                data: bodyFormData
            })
            .then(({data})=>{
                console.log('masuk post article',data.link)
                return axios({
                    method:'post',
                    url:'http://localhost:3000/article',
                    headers:{
                        token:localStorage.getItem('token')
                    },
                    data: {title:this.title,content:contentHtml,featured_image: data.link}
                })
            })
            
            .then(({data})=>{
                console.log(data,'ini data');
                this.author = data.author
                this.read()
                this.title = ''
                quill.setContents([{ insert: '\n' }]);
                this.isSuccess = true
                swal('success','Article is successfuly created','success')
            })
            .catch(err=>{
                console.log(err);
                
                swal('Error', `${err}`, "error")
            })
        },
        read(){
            axios({
                method:'get',
                url:'http://localhost:3000/article/',
                headers:{
                    token:localStorage.getItem('token')
                }
            })
            .then(({data})=>{
                let articleArr = []
                for(index in data) {
                    if(data[index].title.toLowerCase().includes(this.filter)) {
                        articleArr.push(data[index])
                    }
                }
                this.articleData = articleArr
                
            })
            .catch(err=>{
                swal('Error', `${err}`, "error")
            })
        },
        readAll(){
            axios({
                method:'get',
                url:'http://localhost:3000/article/all',
                headers:{
                    token:localStorage.getItem('token')
                }
            })
            .then(({data})=>{
                console.log(data,'ini read alllll');
                this.authorAll = data.author
                let articleArr = []
                for(index in data) {
                    if(data[index].title.toLowerCase().includes(this.filter)) {
                        articleArr.push(data[index])
                    }
                }
                this.articleDataAll = articleArr
                console.log(this.articleDataAll,'aaaaaaaaalllllllll');
                
                
            })
            .catch(err=>{
                swal('Error', `${err}`, "error")
            })
        },
        deleteArticle(id){
            axios({
                method:'delete',
                url:`http://localhost:3000/article/${id}`,
                headers:{
                    token:localStorage.getItem('token')
                }
            })
            .then(_=>{
                this.read()
            })
            .catch(err=>{
                swal('Error', `${err}`, "error")
            })
        },
        updateArticle(){
            axios({
                method:'put',
                url:`http://localhost:3000/article/${this.idTemp}`,
                headers:{
                    token:localStorage.getItem('token')
                },
                data:{title:this.title,content:this.content}
            })
            .then(_=>{
                this.read()
                this.isUpdate = false
                this.isRead = true
                this.title = ''
                swal('success','Article is successfuly updated','success')
            })
            .catch(console.log)
        },
        updateBtn(id,title,content) {
            this.idTemp = id
            this.title = title
            this.content = content
            this.isRead = false
            this.isUpdate = true
        },
        homeBtn() {
            this.isUpdate = false
            this.isRead = false
            this.isHome = true
            this.isWrite = false
        },
        writeBtn(){
            this.isWrite = true
            this.isHome = false
            this.isSuccess = false
            this.isRead = false
            this.isReadAll = false
        },
        readBtn(){
            this.isRead = true
            this.isHome = false
            this.isWrite = false
            this.isReadAll = false
            this.read()
        },
        readAllBtn() {
            this.readAll()
            this.isReadAll = true
            this.isRead = false
            this.isWrite = false
            this.isHome = false
        }
    },
    watch:{
        errTrig() {
            this.isError=''
        },
        filter(){
            this.read()
        }

    },
    created() {
        if(localStorage.token){
            this.isLogin = false
            this.afterLogin = true
            this.isHome = true
            this.read()
            this.readAll()
        }
        
    }
})

let toolbarOptions= [
    ['bold', 'italic', 'underline'],
    [{'header' :[1 ,2 ,3 ,4 ,5 ,6 ,false] }],
    [{'list' :'ordered'}, {'list' :'bullet'}],
    [{'script' :'sub'}, {'script' :'super'}],
    ['image' , 'formula'],
    [{'color' :[] }, {'background' :[] }],
    [{'font' : [] }],
    [{'align' : []} ]
    ];
  let quill = new Quill('#editor',{
    modules: {
      toolbar: toolbarOptions
    },
    placeholder: 'Write content here...',
    theme: 'snow'
  });


  quill.on('text-change', function() {
    contentHtml = quill.root.innerHTML;
  });

// function onSignIn(googleUser) {
//     console.log('masuk masuk masuk');
    
//     var profile = googleUser.getBasicProfile()
//     var id_token = googleUser.getAuthResponse().id_token
    
//     console.log(profile.ig);
    
//     axios({
//         method:'post',
//         url:'http://localhost:3000/user/signGoogle',
//         data: {id_token}
//     })
//     .then(({data}) => {

//         // swal('success', `berhasil lgoin`, "success")
//         localStorage.setItem('token', data)
//         this.isLogin = false
//         this.afterLogin = true
//         this.isHome = true
//         this.isError = false
//     })
//     .catch(err=>{
//         err = JSON.parse(err.response.request.response).message[0]
//         this.isError = true
//         this.errTemp = err
//         // swal('Error', `${this.errTemp}`, "error")
//     })
// }