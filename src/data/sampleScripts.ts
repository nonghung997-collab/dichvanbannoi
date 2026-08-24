export interface SampleScript {
  id: string;
  title: string;
  category: string;
  icon: string;
  suggestedVoiceId: string;
  text: string;
}

export const SAMPLE_SCRIPTS: SampleScript[] = [
  {
    id: "review_phim",
    title: "Tóm Tắt Phim Siêu Cấp",
    category: "Review Phim / Shorts",
    icon: "🎬",
    suggestedVoiceId: "hn_review_male_hung",
    text: `Người đàn ông này vừa bước vào thang máy thì bất ngờ hệ thống điện bị cắt đứt hoàn toàn!
Sau năm phút hoảng loạn trong bóng tối, một tiếng cười quái dị vang lên từ góc trần nhà.
Hóa ra, kẻ đứng sau vụ việc không ai khác chính là người bảo vệ tòa nhà mà anh vừa chào lúc sáng.
Liệu anh ấy có thể thoát khỏi chiếc thang máy tử thần trước khi dưỡng khí cạn kiệt? Hãy cùng theo dõi nhé!`,
  },
  {
    id: "tiktok_sales",
    title: "Livestream Chốt Đơn Siêu Sale",
    category: "Bán Hàng / TikTok",
    icon: "🛍️",
    suggestedVoiceId: "sg_sales_female_my",
    text: `Dạ em xin chào tất cả quý khách hàng thân yêu đang theo dõi livestream hôm nay nha!
Duy nhất trong buổi tối hôm nay, shop em tri ân năm mươi combo siêu phẩm với giá giảm cực sốc, chưa từng có từ trước đến nay!
Chỉ cần để lại bình luận số điện thoại và địa chỉ ngay bên dưới, bên em sẽ giao hàng tận tay hoàn toàn miễn phí vận chuyển trên toàn quốc nha quý vị ơi!`,
  },
  {
    id: "vtv_news",
    title: "Bản Tin Thời Sự Chuyên Nghiệp",
    category: "Thời Sự / Báo Chí",
    icon: "📺",
    suggestedVoiceId: "hn_mc_female_ha",
    text: `Kính chào quý vị và các bạn, mời quý vị cùng theo dõi bản tin thời sự hôm nay.
Sáng nay, tại Trung tâm Hội nghị Quốc gia, diễn đàn chuyển đổi số và ứng dụng trí tuệ nhân tạo đã chính thức khai mạc với sự tham gia của hơn năm trăm chuyên gia công nghệ hàng đầu trong và ngoài nước.
Các giải pháp mới được kỳ vọng sẽ tạo bước đột phá mạnh mẽ cho nền kinh tế số trong thời gian tới.`,
  },
  {
    id: "night_story",
    title: "Kể Chuyện Đêm Khuya Sâu Lắng",
    category: "Truyện Audio / Ru Ngủ",
    icon: "🌙",
    suggestedVoiceId: "hn_story_female_chi",
    text: `Đêm đã về khuya, vạn vật đều chìm vào giấc ngủ êm đềm...
Những con phố dài rợp bóng cây cổ thụ chỉ còn lại tiếng lá xào xạc trong làn gió mát đầu thu.
Hãy thả lỏng toàn bộ cơ thể, hít thở thật sâu và gác lại mọi lo âu của một ngày bận rộn. Chúc bạn có một giấc ngủ thật ngon và những giấc mơ ngọt ngào.`,
  },
  {
    id: "podcast_healing",
    title: "Podcast Chữa Lành Tâm Hồn",
    category: "Podcast / Thiền",
    icon: "☕",
    suggestedVoiceId: "sg_host_male_kiet",
    text: `Chào bạn, cảm ơn bạn đã dành chút thời gian quý báu để lắng nghe tập podcast này.
Đôi khi trong cuộc sống, chúng ta quá vội vã chạy theo những mục tiêu phía trước mà quên mất việc yêu thương chính bản thân mình.
Hãy nhớ rằng, bạn đã làm rất tốt rồi. Cho phép bản thân được nghỉ ngơi một chút nhé, ngày mai nắng sẽ lại lên thôi.`,
  },
  {
    id: "anime_comedy",
    title: "Hoạt Hình Meme Hài Hước",
    category: "Hoạt Hình / Anime",
    icon: "🤡",
    suggestedVoiceId: "anime_meme_cartoon",
    text: `Ối dồi ôi các bác ơi! Hôm nay tôi vừa phát hiện ra một sự thật động trời luôn!
Tôi đã tốn mất ba ngày ba đêm để tìm chiếc chìa khóa nhà bị mất, lục tung cả cái phòng khách lên, ai ngờ nó lại nằm ngay trong túi áo khoác tôi đang mặc trên người. Đúng là đỉnh cao của sự đãng trí mà!`,
  },
  {
    id: "ghost_horror",
    title: "Truyện Ma Kinh Dị Rùng Rợn",
    category: "Kinh Dị / Tâm Linh",
    icon: "👻",
    suggestedVoiceId: "horror_ghost_tale",
    text: `Đó là một đêm trăng khuyết mờ ảo, sương mù dày đặc bao phủ toàn bộ cây cầu gỗ cũ kỹ bắc qua dòng suối sâu.
Tôi đang bước vội về nhà thì bỗng nghe thấy tiếng bước chân bì bõm ngay phía sau lưng... Nhưng khi tôi quay đầu lại nhìn, con đường hoàn toàn vắng tanh không một bóng người... Chỉ có một làn gió lạnh buốt thổi thấu xương tủy!`,
  },
];
