import 'package:flutter/material.dart';

class TermHighlight {
  final String title;
  final String description;
  final IconData icon;
  final Color color;

  const TermHighlight({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
  });
}

class TermArticle {
  final String title;
  final List<String> paragraphs;

  const TermArticle({
    required this.title,
    required this.paragraphs,
  });
}

class AppTermsData {
  
  static List<TermHighlight> getGeneralHighlights(bool isEn) {
    if (isEn) {
      return const [
        TermHighlight(
          title: 'Account Security',
          description: 'Keep your password secret and notify us immediately of any unauthorized access.',
          icon: Icons.security_outlined,
          color: Colors.blue,
        ),
        TermHighlight(
          title: 'Prohibited Conduct',
          description: 'Do not abuse, harass, spam, or upload harmful, illegal materials to the service.',
          icon: Icons.gavel_outlined,
          color: Colors.red,
        ),
        TermHighlight(
          title: 'Privacy Protection',
          description: 'We respect your personal data and handle it securely in accordance with our Privacy Policy.',
          icon: Icons.privacy_tip_outlined,
          color: Colors.green,
        ),
        TermHighlight(
          title: 'Service Updates',
          description: 'We may modify, suspend, or terminate features of the app to improve user experience.',
          icon: Icons.update_outlined,
          color: Colors.orange,
        ),
        TermHighlight(
          title: 'Account Deletion',
          description: 'You can delete your account at any time. Violating terms may result in account termination.',
          icon: Icons.no_accounts_outlined,
          color: Colors.purple,
        ),
      ];
    } else {
      return const [
        TermHighlight(
          title: 'Bảo mật tài khoản',
          description: 'Giữ bí mật mật khẩu của bạn và thông báo ngay lập tức cho chúng tôi nếu phát hiện truy cập trái phép.',
          icon: Icons.security_outlined,
          color: Colors.blue,
        ),
        TermHighlight(
          title: 'Hành vi bị cấm',
          description: 'Không được lạm dụng, quấy rối, gửi thư rác hoặc tải lên các tài liệu gây hại, bất hợp pháp.',
          icon: Icons.gavel_outlined,
          color: Colors.red,
        ),
        TermHighlight(
          title: 'Bảo vệ quyền riêng tư',
          description: 'Chúng tôi tôn trọng dữ liệu cá nhân của bạn và xử lý an toàn theo Chính sách bảo mật.',
          icon: Icons.privacy_tip_outlined,
          color: Colors.green,
        ),
        TermHighlight(
          title: 'Cập nhật dịch vụ',
          description: 'Chúng tôi có thể sửa đổi, tạm ngưng hoặc chấm dứt các tính năng để cải thiện trải nghiệm người dùng.',
          icon: Icons.update_outlined,
          color: Colors.orange,
        ),
        TermHighlight(
          title: 'Xóa tài khoản',
          description: 'Bạn có thể xóa tài khoản bất kỳ lúc nào. Vi phạm điều khoản có thể dẫn đến việc khóa tài khoản.',
          icon: Icons.no_accounts_outlined,
          color: Colors.purple,
        ),
      ];
    }
  }

  static List<TermArticle> getGeneralArticles(bool isEn) {
    if (isEn) {
      return const [
        TermArticle(
          title: 'Article 1: Agreement to Terms',
          paragraphs: [
            'These Terms of Service constitute a legally binding agreement made between you and our platform, concerning your access to and use of this social network application.',
            'By creating an account or accessing the application, you agree that you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these terms, you are prohibited from using the service.',
          ],
        ),
        TermArticle(
          title: 'Article 2: User Eligibility & Account Creation',
          paragraphs: [
            'To register and use our service, you must be at least 13 years of age (or the minimum legal age in your country to consent to data processing).',
            'You agree to provide true, accurate, and complete registration information. You are solely responsible for keeping your information updated.',
          ],
        ),
        TermArticle(
          title: 'Article 3: Account Security',
          paragraphs: [
            'You are responsible for maintaining the confidentiality of your account credentials (username and password) and for all activities that occur under your account.',
            'You must notify us immediately of any unauthorized use of your account or security breach. We cannot and will not be liable for any loss or damage arising from your failure to comply with this security obligation.',
          ],
        ),
        TermArticle(
          title: 'Article 4: Intellectual Property Rights',
          paragraphs: [
            'Unless otherwise indicated, the platform and its source code, databases, design, audio, video, text, and graphics are owned or controlled by us and protected by copyright and trademark laws.',
            'The content you upload remains yours. However, by posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, display, reproduce, modify, and distribute that content solely for the purpose of operating and promoting the platform.',
          ],
        ),
        TermArticle(
          title: 'Article 5: Prohibited Activities',
          paragraphs: [
            'You may not access or use the application for any purpose other than that for which we make it available. Prohibited activities include:',
            '1. Harassing, abusing, or harming another person.',
            '2. Uploading malware, viruses, or any malicious code designed to disrupt the platform.',
            '3. Attempting to bypass security measures or access restricted areas of our servers.',
            '4. Using automated tools (bots, scrapers) to collect platform data without permission.',
            '5. Posting scam messages, fraudulent links, or spam advertising.',
          ],
        ),
        TermArticle(
          title: 'Article 6: Third-Party Links & Services',
          paragraphs: [
            'The service may contain links to third-party websites or services that are not owned or controlled by us.',
            'We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. We strongly advise you to read the terms and policies of any third-party website you visit.',
          ],
        ),
        TermArticle(
          title: 'Article 7: Disclaimers & Warranties',
          paragraphs: [
            'The application is provided on an "AS-IS" and "AS-AVAILABLE" basis. You agree that your use of the services will be at your sole risk.',
            'To the fullest extent permitted by law, we disclaim all warranties, express or implied, in connection with the services and your use thereof, including, without limitation, the implied warranties of merchantability and fitness for a particular purpose.',
          ],
        ),
        TermArticle(
          title: 'Article 8: Limitation of Liability',
          paragraphs: [
            'In no event will we or our affiliates be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit or lost data, arising from your use of the application.',
          ],
        ),
        TermArticle(
          title: 'Article 9: Termination of Service',
          paragraphs: [
            'We reserve the right, in our sole discretion, without notice or liability, to deny access to and use of the application to any person for any reason, including for breach of any representation, warranty, or covenant contained in these Terms.',
            'Upon termination of your account, your right to use the service will immediately cease. You can also self-terminate your account through the Settings page.',
          ],
        ),
        TermArticle(
          title: 'Article 10: Governing Law & Dispute Resolution',
          paragraphs: [
            'These Terms shall be governed by and defined following the laws of Vietnam. You and our platform consent that the courts of Vietnam shall have exclusive jurisdiction to resolve any dispute which may arise.',
          ],
        ),
        TermArticle(
          title: 'Article 11: Contact & Support',
          paragraphs: [
            'If you have any questions or complaints about these terms, please contact our support team in the personal information settings or email us at support@socialnetwork.com.',
          ],
        ),
      ];
    } else {
      return const [
        TermArticle(
          title: 'Điều 1: Thỏa thuận sử dụng',
          paragraphs: [
            'Các Điều khoản sử dụng này cấu thành một thỏa thuận pháp lý ràng buộc giữa bạn và nền tảng của chúng tôi, liên quan đến việc bạn truy cập và sử dụng ứng dụng mạng xã hội này.',
            'Bằng việc tạo tài khoản hoặc truy cập ứng dụng, bạn đồng ý rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi tất cả các Điều khoản sử dụng này. Nếu bạn không đồng ý với tất cả điều khoản, bạn bị cấm sử dụng dịch vụ này.',
          ],
        ),
        TermArticle(
          title: 'Điều 2: Điều kiện & Tạo tài khoản',
          paragraphs: [
            'Để đăng ký và sử dụng dịch vụ của chúng tôi, bạn phải ít nhất 13 tuổi (hoặc độ tuổi tối thiểu theo quy định của quốc gia bạn để đồng ý xử lý dữ liệu).',
            'Bạn đồng ý cung cấp thông tin đăng ký trung thực, chính xác và đầy đủ. Bạn hoàn toàn chịu trách nhiệm về việc cập nhật thông tin của mình.',
          ],
        ),
        TermArticle(
          title: 'Điều 3: Bảo mật tài khoản',
          paragraphs: [
            'Bạn có trách nhiệm bảo mật thông tin đăng nhập tài khoản của mình (tên người dùng và mật khẩu) và đối với mọi hoạt động diễn ra dưới tài khoản của bạn.',
            'Bạn phải thông báo ngay lập tức cho chúng tôi về bất kỳ hành vi sử dụng trái phép nào đối với tài khoản hoặc vi phạm bảo mật. Chúng tôi không chịu trách nhiệm cho bất kỳ tổn thất nào phát sinh do bạn vi phạm nghĩa vụ bảo mật này.',
          ],
        ),
        TermArticle(
          title: 'Điều 4: Quyền sở hữu trí tuệ',
          paragraphs: [
            'Trừ khi có chỉ định khác, ứng dụng và mã nguồn, cơ sở dữ liệu, thiết kế, âm thanh, video, văn bản và đồ họa đều thuộc sở hữu hoặc kiểm soát của chúng tôi và được bảo hộ bởi luật bản quyền và nhãn hiệu.',
            'Nội dung bạn đăng tải vẫn thuộc sở hữu của bạn. Tuy nhiên, bằng cách đăng tải nội dung, bạn cấp cho chúng tôi giấy phép toàn cầu, phi độc quyền, miễn phí bản quyền để sử dụng, hiển thị, sao chép, sửa đổi và phân phối nội dung đó phục vụ cho mục đích vận hành và quảng bá nền tảng.',
          ],
        ),
        TermArticle(
          title: 'Điều 5: Các hành vi bị cấm',
          paragraphs: [
            'Bạn không được truy cập hoặc sử dụng ứng dụng cho bất kỳ mục đích nào ngoài các mục đích mà chúng tôi cung cấp. Các hành vi bị nghiêm cấm bao gồm:',
            '1. Quấy rối, lạm dụng hoặc làm tổn hại người khác.',
            '2. Tải lên mã độc, virus hoặc bất kỳ mã độc hại nào được thiết kế để phá hoại hoạt động của nền tảng.',
            '3. Cố ý vượt qua các biện pháp bảo mật hoặc truy cập trái phép vào các khu vực bị hạn chế của máy chủ.',
            '4. Sử dụng công cụ tự động (bots, scrapers) để thu thập dữ liệu nền tảng mà không được phép.',
            '5. Đăng tải tin nhắn lừa đảo, liên kết gian lận hoặc quảng cáo rác.',
          ],
        ),
        TermArticle(
          title: 'Điều 6: Liên kết & Dịch vụ của bên thứ ba',
          paragraphs: [
            'Dịch vụ có thể chứa các liên kết đến các trang web hoặc dịch vụ của bên thứ ba không thuộc sở hữu hoặc kiểm soát của chúng tôi.',
            'Chúng tôi không kiểm soát và không chịu trách nhiệm về nội dung, chính sách bảo mật hoặc hoạt động của bất kỳ trang web hoặc dịch vụ bên thứ ba nào. Chúng tôi khuyên bạn nên đọc kỹ điều khoản và chính sách của bất kỳ bên thứ ba nào bạn ghé thăm.',
          ],
        ),
        TermArticle(
          title: 'Điều 7: Tuyên bố miễn trừ trách nhiệm',
          paragraphs: [
            'Ứng dụng được cung cấp trên cơ sở "NGUYÊN TRẠNG" và "SẴN CÓ". Bạn đồng ý rằng việc bạn sử dụng dịch vụ sẽ tự chịu mọi rủi ro.',
            'Trong phạm vi pháp luật cho phép, chúng tôi từ chối tất cả các bảo đảm, rõ ràng hoặc ngụ ý, liên quan đến các dịch vụ và việc bạn sử dụng dịch vụ đó, bao gồm nhưng không giới hạn ở các bảo đảm ngụ ý về khả năng thương mại và tính phù hợp cho một mục đích cụ thể.',
          ],
        ),
        TermArticle(
          title: 'Điều 8: Giới hạn trách nhiệm',
          paragraphs: [
            'Trong mọi trường hợp, chúng tôi hoặc các bên liên kết sẽ không chịu trách nhiệm pháp lý với bạn hoặc bất kỳ bên thứ ba nào về bất kỳ thiệt hại trực tiếp, gián tiếp, do hậu quả, ngẫu nhiên, đặc biệt hoặc trừng phạt nào, bao gồm mất lợi nhuận hoặc mất dữ liệu, phát sinh từ việc sử dụng ứng dụng của bạn.',
          ],
        ),
        TermArticle(
          title: 'Điều 9: Chấm dứt dịch vụ',
          paragraphs: [
            'Chúng tôi có quyền, theo quyết định riêng của mình, không cần thông báo hay chịu trách nhiệm pháp lý, từ chối quyền truy cập và sử dụng ứng dụng cho bất kỳ ai vì bất kỳ lý do gì, bao gồm cả việc vi phạm bất kỳ cam kết, bảo đảm hoặc điều khoản nào trong thỏa thuận này.',
            'Khi tài khoản của bạn bị chấm dứt, quyền sử dụng dịch vụ sẽ ngừng ngay lập tức. Bạn cũng có thể tự chấm dứt tài khoản của mình thông qua trang Cài đặt.',
          ],
        ),
        TermArticle(
          title: 'Điều 10: Luật áp dụng & Giải quyết tranh chấp',
          paragraphs: [
            'Các Điều khoản này sẽ được điều chỉnh và định nghĩa theo pháp luật Việt Nam. Bạn và chúng tôi đồng ý rằng các tòa án tại Việt Nam sẽ có thẩm quyền tài phán duy nhất để giải quyết bất kỳ tranh chấp nào phát sinh.',
          ],
        ),
        TermArticle(
          title: 'Điều 11: Liên hệ & Hỗ trợ',
          paragraphs: [
            'Nếu bạn có bất kỳ câu hỏi hoặc khiếu nại nào về các điều khoản này, vui lòng liên hệ với nhóm hỗ trợ của chúng tôi trong cài đặt thông tin cá nhân hoặc gửi email về support@socialnetwork.com.',
          ],
        ),
      ];
    }
  }

  static List<TermHighlight> getSocialHighlights(bool isEn) {
    if (isEn) {
      return const [
        TermHighlight(
          title: 'Community Safety',
          description: 'No hate speech, violence, toxic content, cyberbullying, or online scams.',
          icon: Icons.people_alt_outlined,
          color: Colors.blue,
        ),
        TermHighlight(
          title: 'Content Ownership',
          description: 'You own your uploaded content but grant us license to display it on the network.',
          icon: Icons.cloud_upload_outlined,
          color: Colors.green,
        ),
        TermHighlight(
          title: 'Report Violations',
          description: 'Flag inappropriate content immediately. We review and remove violations within 24 hours.',
          icon: Icons.report_outlined,
          color: Colors.red,
        ),
        TermHighlight(
          title: 'Compliance & Law',
          description: 'Must comply with Cybersecurity Law and user information safety regulations.',
          icon: Icons.policy_outlined,
          color: Colors.purple,
        ),
        TermHighlight(
          title: 'Privacy & Sharing',
          description: 'Control who can view your posts and personal details in account privacy settings.',
          icon: Icons.privacy_tip_outlined,
          color: Colors.orange,
        ),
      ];
    } else {
      return const [
        TermHighlight(
          title: 'An toàn cộng đồng',
          description: 'Không ngôn từ kích động thù địch, bạo lực, nội dung độc hại, bắt nạt mạng hoặc lừa đảo.',
          icon: Icons.people_alt_outlined,
          color: Colors.blue,
        ),
        TermHighlight(
          title: 'Sở hữu nội dung',
          description: 'Bạn sở hữu nội dung tải lên nhưng cấp quyền cho chúng tôi hiển thị nó trên mạng xã hội.',
          icon: Icons.cloud_upload_outlined,
          color: Colors.green,
        ),
        TermHighlight(
          title: 'Báo cáo vi phạm',
          description: 'Báo cáo nội dung không phù hợp. Chúng tôi sẽ xem xét và gỡ bỏ vi phạm trong vòng 24 giờ.',
          icon: Icons.report_outlined,
          color: Colors.red,
        ),
        TermHighlight(
          title: 'Tuân thủ pháp luật',
          description: 'Phải tuân thủ Luật An ninh mạng và các quy định về an toàn thông tin người dùng.',
          icon: Icons.policy_outlined,
          color: Colors.purple,
        ),
        TermHighlight(
          title: 'Quyền riêng tư',
          description: 'Kiểm soát ai có thể xem bài đăng và thông tin cá nhân trong cài đặt quyền riêng tư.',
          icon: Icons.privacy_tip_outlined,
          color: Colors.orange,
        ),
      ];
    }
  }

  static List<TermArticle> getSocialArticles(bool isEn) {
    if (isEn) {
      return const [
        TermArticle(
          title: 'Article 1: Definition of Terms',
          paragraphs: [
            '1. Social Network Platform (or "Social Network"): refers to the entire technology ecosystem, technical infrastructure, including the brand application and products/services provided by integrated partners.',
            '2. Terms of Service ("Agreement"): refers to the terms, conditions, personal data processing notice, and regulations concerning provision and usage of the platform.',
            '3. Personal Data: refers to information in the form of symbols, writings, digits, images, sounds, or similar electronic formats that is associated with a specific person or helps identify them.',
            '4. Social Network ID: is the unified account initialized to distinguish users and manage internal data, providing a single login interface across services.',
            '5. User / You: is the individual accessing and using the platform, bound by this Agreement and other community policies.',
            '6. Intellectual Property: refers to inventions, designs, processes, software codes, copyrighted works, trademarks, and trade names developed or licensed on the platform.',
            '7. User Content: refers to text, photos, audio, video, and other forms of expression uploaded to the platform by users.',
            '8. Authentication Services: refers to the technology solution used to establish and enhance information security, login management, and seamless operations for Users.',
            '9. Social Network Services: refers to the features provided on the Social Network platform that allow users to share status, messages, media, and engage with the community.',
            '10. We / Developer: refers to the creators, developers, and administrators of this Social Network platform.',
            '11. Other terms and phrases have the meanings defined elsewhere in this Agreement.',
          ],
        ),
        TermArticle(
          title: 'Article 2: Service Content',
          paragraphs: [
            'We provide the Social Network platform as a feature to allow registered users to share status, messages, images, and news. Users are responsible for ensuring that all shared information complies with applicable regulations and laws.',
          ],
        ),
        TermArticle(
          title: 'Article 3: Acceptance & Amendment of Terms',
          paragraphs: [
            'By checking "Agree" during registration, you explicitly agree to all terms. We reserve the right to amend these terms at any time. Continued use of the service after amendments indicates acceptance of the new terms.',
          ],
        ),
        TermArticle(
          title: 'Article 4: Use of Services',
          paragraphs: [
            'Users may post content, message friends, join groups, make video calls, and interact with posts. All activities must respect other users\' rights and avoid disrupting platform operations.',
          ],
        ),
        TermArticle(
          title: 'Article 5: Prohibited Content and Activities',
          paragraphs: [
            'Users are strictly prohibited from posting, sharing, or transmitting information that:',
            '1. Opposes the State, undermines national security, unity, or culture.',
            '2. Promotes violence, obscenity, pornography, crime, gambling, or superstition.',
            '3. Discloses state secrets, military secrets, or violates intellectual property rights.',
            '4. Spreads false information, slander, or defames other organizations or individuals.',
            '5. Impersonates other individuals or organizations to commit fraud.',
          ],
        ),
        TermArticle(
          title: 'Article 6: Content Distribution Process',
          paragraphs: [
            'We use algorithms to show relevant posts on the user\'s feed based on interests and interactions. We do not promote content that violates community guidelines, and we reserve the right to deprioritize or hide sensitive contents.',
          ],
        ),
        TermArticle(
          title: 'Article 7: Responsibility for Shared Information',
          paragraphs: [
            'Users are solely responsible for the content they publish, share, or transmit. The platform acts as an intermediary venue and does not actively verify the truthfulness of user content before it is published.',
          ],
        ),
        TermArticle(
          title: 'Article 8: Paid Services & In-App Purchases',
          paragraphs: [
            'Certain advanced features or services may require payments. Users agree to abide by the corresponding payment policy, billing terms, and refund guidelines when purchasing services.',
          ],
        ),
        TermArticle(
          title: 'Article 9: User Rights & Obligations',
          paragraphs: [
            'You have the right to construct your profile, upload content, interact with others, and control privacy. You are obligated to protect your account, respect copyrights, and follow local laws.',
          ],
        ),
        TermArticle(
          title: 'Article 10: Service Provider Rights & Obligations',
          paragraphs: [
            'We have the right to moderate content, block violating accounts, and update services. We are obligated to protect user data, maintain server uptime, and handle reports about violations.',
          ],
        ),
        TermArticle(
          title: 'Article 11: Privacy & Data Protection',
          paragraphs: [
            'We collect and process your personal data in accordance with our Privacy Policy. We implement strict technical and security measures to protect your database from unauthorized access, leakage, or loss.',
          ],
        ),
        TermArticle(
          title: 'Article 12: User Content License',
          paragraphs: [
            'You retain ownership of your content. By posting it on the social network, you grant us a royalty-free, perpetual, transferable license to store, distribute, display, and perform your content to operate the platform.',
          ],
        ),
        TermArticle(
          title: 'Article 13: Limitation of Liability',
          paragraphs: [
            'We do not guarantee that the service will be error-free or uninterrupted. We are not liable for any financial or non-financial damages resulting from service interruptions or loss of user-generated data.',
          ],
        ),
        TermArticle(
          title: 'Article 14: Handling Violations & Suspension',
          paragraphs: [
            'If a user violates any term of this Agreement, we reserve the right to:',
            '1. Issue a formal warning in-app.',
            '2. Restrict certain account privileges (posting, commenting, or messaging).',
            '3. Temporarily suspend the account (7 days to 30 days).',
            '4. Permanently terminate/delete the account and IP address from the database.',
          ],
        ),
        TermArticle(
          title: 'Article 15: Account Deletion',
          paragraphs: [
            'Users can trigger permanent account deletion in settings. All personal data and posts will be queued for deletion and permanently erased after 24 hours, except where retention is legally required.',
          ],
        ),
        TermArticle(
          title: 'Article 16: Reporting System for Malicious Content',
          paragraphs: [
            'We provide a simple "Report" button on posts, profiles, and comments. Reports are automatically queued and reviewed by our security team. Actions will be taken on valid violations within 24 hours.',
          ],
        ),
        TermArticle(
          title: 'Article 17: Copyright Infringement & DMCA',
          paragraphs: [
            'We respect intellectual property. If you believe your copyrighted work is hosted on our platform without permission, please submit a copyright claim with evidence, and we will take it down immediately.',
          ],
        ),
        TermArticle(
          title: 'Article 18: Advertising & Monetization',
          paragraphs: [
            'We may display advertisements and sponsored content on the social feed. Advertisements will be clearly labeled as sponsored, and users can adjust ad preferences in settings.',
          ],
        ),
        TermArticle(
          title: 'Article 19: Modification of Service',
          paragraphs: [
            'We may add or remove functionalities, change parameters, or completely cease a portion of the services at any time. We will attempt to notify users of major updates.',
          ],
        ),
        TermArticle(
          title: 'Article 20: Governing Law',
          paragraphs: [
            'This agreement and the relationship between you and the platform developers are governed by the laws of Vietnam, without regard to conflict of law principles.',
          ],
        ),
        TermArticle(
          title: 'Article 21: General Provisions',
          paragraphs: [
            'If any provision of this Agreement is found invalid, it will be severed, and the remaining provisions will continue in full force. No waiver of any terms will be deemed a further or continuing waiver.',
          ],
        ),
      ];
    } else {
      return const [
        TermArticle(
          title: 'Điều 1: Giải thích từ ngữ',
          paragraphs: [
            '1. Nền Tảng Social Network (hoặc "Social Network"): là toàn bộ hệ sinh thái công nghệ, hạ tầng kĩ thuật, bao gồm nhưng không giới hạn ứng dụng mang thương hiệu Social Network và các sản phẩm, dịch vụ được cung cấp bởi đối tác tích hợp trên Nền Tảng Social Network.',
            '2. Thoả Thuận Sử Dụng Dịch Vụ Mạng Xã Hội Social Network ("Thoả thuận"): là thỏa thuận bao gồm các điều khoản, điều kiện, thông báo xử lý Dữ Liệu Cá Nhân và các quy định liên quan tới cung cấp và sử dụng Mạng xã hội Social Network cùng với tất cả các bản sửa đổi, bổ sung, cập nhật.',
            '3. Dữ Liệu Cá Nhân: là thông tin dưới dạng ký hiệu, chữ viết, chữ số, hình ảnh, âm thanh hoặc dạng tương tự trên môi trường điện tử gắn liền với một con người cụ thể hoặc giúp xác định một con người cụ thể. Dữ Liệu Cá Nhân bao gồm Dữ Liệu Cá Nhân cơ bản và Dữ Liệu Cá Nhân nhạy cảm.',
            '4. Tài Khoản Social Network ID (hoặc "Tài Khoản"): là tài khoản được khởi tạo dùng để phân biệt mỗi Người Dùng và quản lý dữ liệu nội bộ sau khi Người Dùng đăng ký thông tin thành công và chấp thuận các điều khoản dịch vụ và chính sách cần thiết trên Social Network.',
            '5. Người Dùng/Bạn/Chủ thể dữ liệu: là bên truy cập, sử dụng Mạng xã hội Social Network, là cá nhân được Dữ Liệu Cá Nhân phản ánh, là bên còn lại chịu sự ràng buộc của Thỏa thuận này và những quy trình, quy chế, chính sách cộng đồng khác.',
            '6. Sở Hữu Trí Tuệ: là những sáng chế, cải tiến, thiết kế, quy trình, công thức, phương pháp, cơ sở dữ liệu, thông tin, mã nguồn, chương trình máy tính, tác phẩm có bản quyền, nhãn hiệu thương mại và tên thương hiệu trên nền tảng.',
            '7. Nội dung Người Dùng: là nội dung dưới dạng văn bản, hình ảnh, âm thanh và các dạng thể hiện khác do Người Dùng tải lên Mạng xã hội Social Network phù hợp với Thoả thuận này.',
            '8. Social Network ID: là giải pháp công nghệ xác thực được tích hợp để thiết lập, quản lý đăng nhập và tăng cường bảo mật thông tin xuyên suốt cho Người dùng.',
            '9. Mạng xã hội Social Network (hoặc “MXH Social Network”): là không gian mạng xã hội được thiết lập trên ứng dụng để các thành viên chia sẻ thông tin, kết nối và tương tác phù hợp quy định pháp luật.',
            '10. Chúng tôi / Nhà phát triển / Ban quản trị: là người sáng lập, thiết lập, vận hành và quản lý nền tảng Mạng xã hội này.',
            '11. Các từ, cụm từ khác như được định nghĩa tại Thỏa thuận này.',
          ],
        ),
        TermArticle(
          title: 'Điều 2: Nội dung dịch vụ',
          paragraphs: [
            'Chúng tôi cung cấp Mạng xã hội Social Network - được xác định là một tính năng trên ứng dụng để các cá nhân, tổ chức chia sẻ thông tin, hình ảnh, trạng thái thuộc các lĩnh vực đời sống, giải trí phù hợp theo quy định pháp luật. Các tính năng khác trên Social Network không thuộc phạm vi mạng xã hội này.',
          ],
        ),
        TermArticle(
          title: 'Điều 3: Chấp nhận điều khoản sử dụng và sửa đổi',
          paragraphs: [
            'Bằng việc xác nhận sự đồng ý với Thỏa thuận này, Người Dùng cam kết đã đọc, hiểu và đồng ý với tất cả nội dung. Chúng tôi có quyền sửa đổi Thỏa thuận bất kỳ lúc nào, các nội dung thay đổi sẽ có hiệu lực ngay khi được đăng tải công khai trên ứng dụng.',
          ],
        ),
        TermArticle(
          title: 'Điều 4: Sử dụng dịch vụ',
          paragraphs: [
            'Người dùng có quyền chia sẻ bài đăng, gửi tin nhắn, tham gia nhóm trò chuyện, gọi video và tương tác với bài viết của người khác. Bạn có trách nhiệm tự bảo vệ thông tin đăng nhập và sử dụng dịch vụ văn minh.',
          ],
        ),
        TermArticle(
          title: 'Điều 5: Các nội dung cấm trao đổi và chia sẻ trên mạng xã hội',
          paragraphs: [
            'Nghiêm cấm người dùng tải lên, đăng tải hoặc chia sẻ các thông tin có nội dung:',
            '1. Chống phá Nhà nước, gây nguy hại đến an ninh quốc gia, trật tự an toàn xã hội.',
            '2. Kích động bạo lực, dâm ô, đồi trụy, tội ác, tệ nạn xã hội, mê tín dị đoan.',
            '3. Tiết lộ bí mật nhà nước, bí mật quân sự hoặc xâm phạm quyền sở hữu trí tuệ của tổ chức, cá nhân khác.',
            '4. Đưa thông tin xuyên tạc, vu khống, xúc phạm uy tín của tổ chức, danh dự và nhân phẩm của cá nhân.',
            '5. Giả mạo tổ chức, cá nhân và phát tán thông tin giả mạo, thông tin sai sự thật.',
          ],
        ),
        TermArticle(
          title: 'Điều 6: Quy trình phân bố nội dung trên mạng xã hội',
          paragraphs: [
            'Chúng tôi sử dụng các thuật toán gợi ý để hiển thị bài đăng phù hợp với sở thích của người dùng. Chúng tôi cam kết không phân phối và có quyền hạ hiển thị các nội dung có dấu hiệu vi phạm chuẩn mực cộng đồng hoặc bị báo cáo vi phạm.',
          ],
        ),
        TermArticle(
          title: 'Điều 7: Trách nhiệm về nội dung trao đổi thông tin',
          paragraphs: [
            'Người dùng chịu trách nhiệm hoàn toàn về mọi thông tin, hình ảnh hoặc tài liệu do mình khởi tạo, đăng tải hoặc chia sẻ trên MXH. Chúng tôi không chịu trách nhiệm đối với bất kỳ thiệt hại nào phát sinh từ nội dung do người dùng tự đăng tải.',
          ],
        ),
        TermArticle(
          title: 'Điều 8: Sử dụng dịch vụ tính phí',
          paragraphs: [
            'Một số dịch vụ nâng cao hoặc quà tặng ảo có thể yêu cầu thanh toán. Người dùng đồng ý tuân thủ các quy định thanh toán, biểu phí và chính sách hoàn tiền tương ứng được áp dụng tại thời điểm giao dịch.',
          ],
        ),
        TermArticle(
          title: 'Điều 9: Quyền và nghĩa vụ của người dùng',
          paragraphs: [
            'Người dùng có quyền thiết lập thông tin cá nhân, chia sẻ nội dung hợp pháp, tương tác xã hội và yêu cầu hỗ trợ. Đồng thời phải tuân thủ nghiêm túc các quy tắc cộng đồng, quy định an ninh mạng và tôn trọng bản quyền nội dung.',
          ],
        ),
        TermArticle(
          title: 'Điều 10: Quyền và nghĩa vụ của nhà cung cấp',
          paragraphs: [
            'Chúng tôi có quyền kiểm duyệt nội dung, chặn tài khoản vi phạm, nâng cấp tính năng dịch vụ. Đồng thời có nghĩa vụ bảo mật dữ liệu cá nhân của người dùng, duy trì tính ổn định của máy chủ và xử lý các báo cáo vi phạm cộng đồng.',
          ],
        ),
        TermArticle(
          title: 'Điều 11: Bảo mật thông tin và dữ liệu cá nhân',
          paragraphs: [
            'Chúng tôi thu thập và xử lý dữ liệu cá nhân theo Chính sách quyền riêng tư. Chúng tôi cam kết áp dụng các biện pháp kỹ thuật tối ưu để ngăn chặn các truy cập trái phép, rò rỉ hoặc mất mát dữ liệu của người dùng.',
          ],
        ),
        TermArticle(
          title: 'Điều 12: Sở hữu trí tuệ và giấy phép nội dung',
          paragraphs: [
            'Người dùng giữ mọi quyền sở hữu đối với nội dung do mình tải lên. Bằng việc đăng tải, người dùng cấp cho chúng tôi giấy phép không độc quyền, miễn phí, có hiệu lực toàn cầu để lưu trữ, truyền phát và hiển thị nội dung đó trên hệ thống.',
          ],
        ),
        TermArticle(
          title: 'Điều 13: Giới hạn trách nhiệm pháp lý',
          paragraphs: [
            'Chúng tôi không bảo đảm dịch vụ luôn hoạt động ổn định không có lỗi. Chúng tôi được miễn trừ trách nhiệm trước mọi tổn hại hoặc gián đoạn hoạt động phát sinh do sự cố đường truyền internet hoặc các sự kiện bất khả kháng.',
          ],
        ),
        TermArticle(
          title: 'Điều 14: Biện pháp xử lý vi phạm',
          paragraphs: [
            'Trong trường hợp người dùng vi phạm Thỏa thuận này hoặc quy tắc cộng đồng, chúng tôi có quyền:',
            '1. Gửi cảnh cáo trực tiếp trong ứng dụng.',
            '2. Tạm khóa một số tính năng (đăng bài, bình luận, nhắn tin).',
            '3. Tạm khóa tài khoản từ 7 đến 30 ngày.',
            '4. Khóa vĩnh viễn tài khoản và xóa thông tin liên quan.',
          ],
        ),
        TermArticle(
          title: 'Điều 15: Tạm khóa và khóa tài khoản',
          paragraphs: [
            'Người dùng có thể tự xóa tài khoản của mình thông qua chức năng Xóa tài khoản trong Cài đặt. Tài khoản sẽ ở trạng thái chờ xóa và bị xóa vĩnh viễn sau 24 giờ kể từ thời điểm yêu cầu.',
          ],
        ),
        TermArticle(
          title: 'Điều 16: Cơ chế báo cáo nội dung xấu độc',
          paragraphs: [
            'Ứng dụng cung cấp công cụ báo cáo (Report) trên mỗi bài đăng, bình luận hoặc tài khoản. Đội ngũ kiểm duyệt của chúng tôi sẽ xử lý các báo cáo hợp lệ và thực hiện gỡ bỏ nội dung vi phạm trong vòng 24 giờ.',
          ],
        ),
        TermArticle(
          title: 'Điều 17: Xử lý vi phạm bản quyền',
          paragraphs: [
            'Chúng tôi tôn trọng quyền sở hữu trí tuệ. Nếu bạn phát hiện nội dung của mình bị sao chép trái phép trên hệ thống, vui lòng gửi yêu cầu bản quyền kèm bằng chứng chứng minh, chúng tôi sẽ gỡ bỏ ngay lập tức.',
          ],
        ),
        TermArticle(
          title: 'Điều 18: Quảng cáo và Nội dung tài trợ',
          paragraphs: [
            'Chúng tôi có thể hiển thị quảng cáo hoặc nội dung được tài trợ trên trang tin tức. Nội dung quảng cáo sẽ được đánh nhãn phù hợp, người dùng có thể tùy chỉnh hiển thị quảng cáo trong phần cài đặt tài khoản.',
          ],
        ),
        TermArticle(
          title: 'Điều 19: Thay đổi thỏa thuận và dịch vụ',
          paragraphs: [
            'Chúng tôi liên tục cải tiến dịch vụ và có quyền thay đổi thông số kỹ thuật, ngừng cung cấp một phần tính năng mà không cần chịu trách nhiệm. Các thay đổi lớn sẽ được thông báo trước trên giao diện ứng dụng.',
          ],
        ),
        TermArticle(
          title: 'Điều 20: Luật áp dụng và cơ quan tài phán',
          paragraphs: [
            'Thỏa thuận này được điều chỉnh và giải thích theo luật pháp Việt Nam. Mọi tranh chấp phát sinh từ Thỏa thuận sẽ được đưa ra giải quyết tại Tòa án có thẩm quyền tại Việt Nam.',
          ],
        ),
        TermArticle(
          title: 'Điều 21: Điều khoản chung',
          paragraphs: [
            'Việc bất kỳ điều khoản nào bị vô hiệu theo quyết định của cơ quan nhà nước có thẩm quyền sẽ không ảnh hưởng đến hiệu lực của các điều khoản còn lại của Thỏa thuận này. Thỏa thuận này có giá trị ràng buộc cao nhất giữa Người dùng và Nhà phát triển.',
          ],
        ),
      ];
    }
  }
}
