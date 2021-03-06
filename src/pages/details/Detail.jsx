import React, { useState, useEffect, memo, useRef } from 'react';
import { connect } from 'react-redux'
import Swiper from 'swiper';
import "swiper/css/swiper.min.css";

//组件导入
import HeadComponent from '../../common/headcomponent/HeadComponent';
import DetailBottom from '../../common/detailbottom/DetailBottom';
import Detailhead from '../../common/detailhead/Detailhead';
import DetailItemPage from '../../components/detail/detailitempage/DetailItemPage'
import Recommend from '../../components/detail/recommend/Recommend'
import SpecificationsPopup from '../../components/specificationsPopup/SpecificationsPopup';

import * as FunActionTypes from './store/actionCreators'
//资源导入
import { reqdetail } from '../../api/index'
import { Rotation,  Title, Discount, Fromwarp,ImgIndex } from './detail.style.js'

const Detail = (props) => {
    const [detailtitle, setdetailtitle] = useState(null)
    const [detailprice, setdetailprice] = useState(0)

    const [activeIndex, setActiveIndex] = useState(0)
    const [downDisplay, setdownDisplay] = useState(false)
    const { orderdata } = props;
    const { getinitorderData, setdetailData, getrecentNumData } = props;

    // 回退
    const handleback = (e) => {
        e.preventDefault();
        // console.log("hist", props);
        props.history.goBack();
    }

    // 根据url的参数 请求数据 并存入store
    useEffect(() => {

        // console.log("详情页面数据props", props)
        // console.log("详情页面数据propsid", decodeURIComponent(props.location.search.split("=")[1]))

        reqdetail(decodeURIComponent(props.location.search.split("=")[1])).then((res) => {
            // console.log("详情页面数据", res)
            if (res.data.success) {
                setdetailtitle(res.data.data[0].title);
                setdetailprice(res.data.data[0].price);
            }
        })
    }, [])
    
    // 轮播
    const DetailSwiper = new Swiper('.swiper-container', {
        lazy: {
            loadPrevNext: true,
        },
        // watchSlidesProgress: true,
        // on: {
        //     progress: function (progress) {
        //         // console.log(".........",progress);
        //         if (Math.abs(progress) === 0) {
        //             return;
        //         }
        //         if (Number.isInteger(progress * 2)) {
        //             setimgIndex(Math.floor(progress * 2))
        //         }
        //         // setimgIndex(Math.floor(progress))
        //     }
        // },
        pagination: {
            el: '.swiper-pagination',
            type: 'custom',
            renderCustom: function (swiper, current, total) {
              return current + ' / ' + total;
            }
      },
    })

    //  console.log("8888",DetailSwiper); 
    // DetailSwiper.slides[0].progress;
    const address = useRef();
    const size = useRef();
    const time = useRef();
    const tell =useRef();
    const type = 0;

    // 拿到文本框的输入值 存入store 页面跳转payment
    const handleclick = (e) => {
        e.preventDefault()
        // console.log("提交数据", time.current.value);


        let Daddress = address.current.value;
        let Dsize = size.current.value;
        let Dtime = time.current.value;
        let Dtell = tell.current.value;
        if (!Daddress) {
            // console.log("请输入地址！")
            return;
        } else if (!Dsize) {
            // 自动弹出
            handleonclickchange();
            return;
        } else if (!Dtime) {
            // console.log("请输入时间！")
            return;
        }

        let data = {
            address: Daddress,
            size: Dsize,
            time: Dtime,
            title: detailtitle,
            price: detailprice,
            tell: Dtell
        }
        // console.log(data,'111111111111')
        setdetailData(data);
        props.history.push(`/payment/${data}`)

        // onAddOrder(address.current.value, size.current.value, time.current.value, Math.floor(Math.random()*4))
    }

    // const onAddOrder = (Dadr, Dsize, Dtime, Dtype) => {
    //     if (Dadr && Dsize && Dtime) {
    //         let data = StorageUtils.getUserorder();
    //         // data?
    //         let newdata = data ? (data + ";" + `{address:'${Dadr}',size:'${Dsize}',time:'${Dtime}',type:'${Dtype}'}`) : (`{address:'${Dadr}',size:'${Dsize}',time:'${Dtime}',type:'${Dtype}'}`)
    //         // 存到本地
    //         StorageUtils.saveUserorder(newdata)
    //         // 存到store
    //         addorderData(newdata);
    //     }
    // }

    // const onAddRecentNum = (num) => {
    //     // 存到本地
    //     StorageUtils.saveRecentNum(num);
    //     // 存到store
    //     addorderData(num);
    // }


    useEffect(() => {
        if (!orderdata.length) {
            getinitorderData();
        }
        getrecentNumData()
    }, [])

    // 若服务规格为空则自动弹出
    const handleonclickchange = () => {
        setdownDisplay(!downDisplay);
    }

    // 服务规格弹出框
    const handleOnclickComfirm = (area, num) => {
        // console.log("面积数量",area,num);
        // setspecifications(`${area} ${num}`)
        size.current.value = `${area} ${num}`;
        handleonclickchange()
    }

    // 一层级联
    const handleTabClick = (e) => {
        const activeIndex = e.target.getAttribute("data-index")
        setActiveIndex(parseInt(activeIndex));
        const ltab = e.target.getAttribute("data-ltab")
        const rtab = document.querySelector(`[data-rtab="${ltab}"]`)
        // 滑动定位到顶端
        rtab.scrollIntoView({
            behavior: 'smooth'
        })
    }


    let ranges = [];
    const ref = useRef();
    let base = 0;
    useEffect(() => {
        const tabDetail = ref.current;
        // console.log("tabDetail",tabDetail);

        // 商品 详情 推荐
        const tabs = tabDetail.querySelectorAll(`[data-rtab]`)
        // console.log("tabs",tabs);
        // ranges收集每个的高度
        for (let tab of tabs) {
            let h = tab.clientHeight;
            // console.log("tabsH",h);
            let newH = base + h;
            ranges.push([base, newH])
            base = newH;
        }
        
        // 页面滚动到位置的index
        function onScroll(e) {

            const scrollTop = document.documentElement.scrollTop + 300;
            const index = ranges.findIndex(range => scrollTop >= range[0] && scrollTop < range[1])
            // console.log("ref",ref.current.scrollTop,ref,e);

            setActiveIndex(index)
        }
        tabDetail.addEventListener('touchstart', () => {
            tabDetail.addEventListener('touchmove', onScroll)

        })
        tabDetail.addEventListener('touchend', () => {
            tabDetail.removeEventListener('touchmove', onScroll);

        })
    }, [])

    return (
        <>
            {/* 服务规格弹出框 */}
            <SpecificationsPopup handleOnclickBack={handleonclickchange} handleOnclickComfirm={handleOnclickComfirm} display={downDisplay} />

            <HeadComponent title={detailtitle} handleback={handleback} />

            <Detailhead index={activeIndex} handleTabClick={handleTabClick} />

            <div ref={ref}>

                <div data-rtab="商品">
                    <Rotation>
                        <div className="swiper-container">
                            <div className="swiper-wrapper ">
                                <div className="swiper-slide">
                                    <img data-src="https://images.daojia.com/pic/commodity/online/9275c6db764bbe4cb4f83aa5a7dbdd39.png?x-oss-process=image/auto-orient,0/format,webp" data-index="0" className="swiper-lazy" />
                                    <div className="swiper-lazy-preloader"></div>
                                </div>
                                <div className="swiper-slide">

                                    <img data-src="https://images.daojia.com/pic/commodity/online/1a247a084e9d63fc0ba80cdc5612e998.png?x-oss-process=image/auto-orient,0/format,webp" data-index="1" className="swiper-lazy" />
                                    <div className="swiper-lazy-preloader"></div>
                                </div>
                                <div className="swiper-slide">
                                    <img data-src="https://images.daojia.com/pic/commodity/online/f67c550b6c0b42da7b40d5559bd80075.png?x-oss-process=image/auto-orient,0/format,webp" data-index="2" className="swiper-lazy" />
                                    <div className="swiper-lazy-preloader"></div>
                                </div>
                            </div>
                        </div>
                        
        

                    </Rotation>
                    <ImgIndex>
                        <div className="swiper-pagination swiper-pagination-custom" 
                        style={{bottom:"2px"}}
                        >
                        </div>
                    </ImgIndex>
                    <Title>
                        <div className="price">
                            ￥ <span>{detailprice}</span>.00/平起
                        </div>
                        <div className="type">
                            擦玻璃
                        </div>
                        <div className="describe">
                            <span>双面精细擦窗，服务有标准，清洁看得见</span>
                        </div>
                        <div className="tabs">
                            <span className="icon-shezhi iconfont">
                                &#xe785;随时预约
                            </span>
                            <span className="icon-shezhi iconfont">
                                &#xe785;专业清洗工具
                            </span>
                            <span className="icon-shezhi iconfont">
                                &#xe785;阿姨专业培训
                            </span>
                        </div>
                    </Title>
                    <Discount>
                        <div className="icon">优惠</div>
                        <div className="text">7.5折优惠券</div>
                        <button>
                            <span>立即领取</span>
                        </button>
                    </Discount>
                    <Fromwarp>
                        {/* <iframe name="targetIfr" style={{ display: "none" }}></iframe> */}
                        <form id="Form1" action="" className="form">
                            <div className="forminput">
                                <label>地址</label><input ref={address} type="text" name="addres" id="" placeholder="请选择服务地址" autoComplete='off' />
                            </div>
                            <div className="forminput">

                                <label>规格</label><input ref={size} type="text" name="size" id="" placeholder="请选择服务规则" autoComplete='off' onFocus={handleclick} />
                            </div>
                            <div className="forminput">
                                <label>时间</label><input ref={time} type="text" name="time" id="" placeholder="请选择待服务时间" autoComplete='off' />
                            </div>
                            <div className="forminput">
                                <label>电话</label><input ref={tell} type="text" name="tell" id="" placeholder="请填写联系方式" autoComplete='off' />
                            </div>

                            <DetailBottom handleclick={handleclick} />
                        </form>
                    </Fromwarp>
                </div>
                <DetailItemPage />
                <Recommend />
            </div>


        </>

    )
}

function mapStateToProps(state) {
    return {
        orderdata: state.order.orderdata,
        // recentnum:state.order.recentnum

    }

}
function mapDispatchToProps(dispatch) {
    return {
        // 取出本地order数据
        getinitorderData() {
            dispatch(FunActionTypes.initorderData())
        },

        addorderData(data) {
            dispatch(FunActionTypes.addorderData(data))
        },
        // detail数据
        setdetailData(data) {
            dispatch(FunActionTypes.setorderdetailData(data))
        },
        getrecentNumData() {
            dispatch(FunActionTypes.getrecentNum())
        }

    }
}
export default connect(mapStateToProps, mapDispatchToProps)(memo(Detail))

