class apiFeature {
    constructor(query,queryStr){
        this.query=query;
        this.queryStr=queryStr;
    }
    search(){
        const keyword=this.queryStr.keyword;
        const temp=keyword?{
               name:{
                   $regex:keyword,
                   $options:"i"
               } 
        }:{};
       this.query= this.query.find({...temp});
       return this;
    }
}
module.exports=apiFeature;