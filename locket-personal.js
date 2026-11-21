// ============================================================
// Locket Remote Config Rewrite
// Dùng cho: Loon / Quantumult X / Surge / Shadowrocket
// cre dinhduyvinh09
// ============================================================

var ua = $request.headers["User-Agent"] || $request.headers["user-agent"] || "";
var obj = JSON.parse($response.body);

if (ua.includes("Locket")) {
    obj.Attention = "Chúc mừng bạn! Vui lòng không bán hoặc chia sẻ cho người khác!";
    obj.entries = obj.entries || {};

    // ============================================================
    // 1. CẤU HÌNH GOLD, FEATURE GATES & PAYWALL
    // ============================================================
    Object.assign(obj.entries, {
        feature_gates: JSON.stringify({
            app_icon_picker: "enabled",
            camera_roll: "enabled",
            camera_theme: "enabled",
            locket_views: "enabled",
            long_captions: "enabled",
            longer_video: "enabled",
            unlimited_friends: "enabled",
            priority_support: "enabled",
            profile_badge: "enabled",
            remove_ads: "enabled",
            video: "enabled",
            custom_widget_frames: "enabled",
            streak_recovery: "enabled"
        }),
        upsell_features: JSON.stringify({
            app_icon_picker: true,
            camera_roll: true,
            camera_theme: true,
            locket_views: true,
            remove_ads: true,
            custom_widget_frames: true
        }),
        paywall_presentation_config: JSON.stringify({
            uid: "paywall_testflight",
            onboarding: false,
            after_sent_moment: false,
            on_foreground: false,
            interval: 2592000,
            profile_banner: true
        }),
        feature_discovery_popup_config: JSON.stringify({
            tag: "LOC KET GÔN",
            tag_gradient: true,
            tag_style: "gold_gradient",
            title: "Tran Thien Phu",
            feature_set: [
                {
                    title: "Success...",
                    body: "private custom",
                    
                
                }
            ],
            primary_button_title: "start",
            campaign: "locket_gold_welcome_v3",
            start_at: "2005-10-21T00:00:00",
            end_at: "2099-12-31T23:59:59",
            use_local_time_zone: true
        }),
        android_subscribe_gold_button_enabled: "false",
        profile_badge_visible: "true",
        lunar_new_year_app_icon_enabled: "true",
        settings_instagram_url: "he he",
        settings_tiktok_url: "hi hi"
    });

    // ============================================================
    // 2. CHẶN QUẢNG CÁO & TẮT TRACKING (SENTRY)
    // ============================================================
    Object.assign(obj.entries, {
        history_ads_mode: "off",
        history_ads_prefetch_count: "0",
        history_ads_prefetch_immediate: "false",
        history_ads_prefetch_reroute: "false",
        history_ads_dynamic_insertion: "false",
        history_ads_refresh_prefetch_on_foreground: "false",
        history_ads_floor_price: "0",
        history_ads_floor_price_att: "0",
        history_ad_log_displayed_on_background: "false",
        history_ads_debug_menu: "false",
        sentry_sample_rate: "0",
        sentry_network_tracing: "false",
        sentry_performance_tracking: "false",
        sentry_trace_sample_rate: "0",
        sentry_profiles_sample_rate: "0"
    });

    // ============================================================
    // 3. CAMERA, VIDEO, FILTERS & UPLOAD QUALITY
    // ============================================================
    var MY_VIDEO_DURATION = 45.0;
    
    var cameraConfig = {
        gold_max_duration: MY_VIDEO_DURATION,
        goldMaxDuration: MY_VIDEO_DURATION,
        max_duration: MY_VIDEO_DURATION,
        maxDuration: MY_VIDEO_DURATION,
        ultra_wide: true,
        ultraWide: true,
        volume_button: true,
        volumeButton: true,
        flash_button: true,
        telephoto: true,
        srgb: true,
        lanczos: true,
        quality_mbps: 0.5,
        qualityMbps: 0.5
    };

    var cameraRollConfig = {
        gold_max_duration: MY_VIDEO_DURATION,
        goldMaxDuration: MY_VIDEO_DURATION,
        video_max_duration: MY_VIDEO_DURATION,
        videoMaxDuration: MY_VIDEO_DURATION,
        max_duration: MY_VIDEO_DURATION,
        maxDuration: MY_VIDEO_DURATION,
        trim_max_duration: MY_VIDEO_DURATION,
        trimMaxDuration: MY_VIDEO_DURATION,
        camera_roll_max_duration: MY_VIDEO_DURATION,
        camera_roll_video_max_duration: MY_VIDEO_DURATION,
        max_file_size: 104857600,       // Cho phép file tối đa 100MB từ thư viện
        max_upload_bytes: 104857600,   // Nới lỏng giới hạn dung lượng tải lên
        max_size_bytes: 104857600,
        quality_mbps: 0.5,
        qualityMbps: 0.5,
        flash_button: true
    };

    obj.entries.camera = JSON.stringify(cameraConfig);
    obj.entries.camera_roll = JSON.stringify(cameraRollConfig);

    var durationStr = MY_VIDEO_DURATION.toString();
    Object.assign(obj.entries, {
        live_photos: JSON.stringify({
            capture: true,
            viewing: true,
            catch_up: true,
            widget_looping_mode: "never"
        }),
        camera_filter_config: JSON.stringify({
            allows_custom_filters: true,
            show_filter_button: true,
            sheet_enabled: true,
            open_sheet_immediately: true,
            sheet_filters: [
                { title: { en: "Goofy" }, filter_ids: ["okay_wig", "influencer", "looks_maxxing", "toothless", "bye_brows"] },
                { title: { en: "Looks" }, filter_ids: ["bowling_ball", "blonde_bleached", "beard", "bob_cut", "buns", "tatted", "mohawk", "braces", "bye_brows"] },
                { title: { en: "Celebrate" }, filter_ids: ["slimed", "princess", "disco_lights", "cash_money", "happy_birthday"] },
                { title: { en: "Cute" }, filter_ids: ["cutesy", "sticker_face", "flower_crown", "love_bug"] },
                { title: { en: "Costumes" }, filter_ids: ["wedding", "cowboy_cowgirl", "giraffe", "clown"] },
                { title: { en: "Holidays" }, filter_ids: ["easter_bunney_cutout", "easter_chick_cutout", "bearded", "leprechaun", "lucky_face", "sweet_hearts", "elf_cutout", "santa_cutout", "frosty"] }
            ],
            picker_filters: [
                "okay_wig", "influencer", "looks_maxxing", "toothless", "bye_brows",
                "bowling_ball", "blonde_bleached", "beard", "bob_cut", "buns",
                "tatted", "mohawk", "braces", "slimed", "princess",
                "disco_lights", "cash_money", "happy_birthday", "cutesy", "sticker_face",
                "flower_crown", "love_bug", "wedding", "cowboy_cowgirl", "giraffe",
                "clown", "easter_bunney_cutout", "easter_chick_cutout", "bearded", "leprechaun",
                "lucky_face", "sweet_hearts", "elf_cutout", "santa_cutout", "frosty"
            ]
        }),
        camera_roll_preview_enabled: "true",
        camera_roll_video_enabled: "true",
        camera_roll_video_upload_enabled: "true",
        internal_camera_roll_video_upload_enabled: "true",
        longer_camera_roll_videos_enabled: "true",
        camera_roll_video_max_duration: durationStr,
        camera_roll_max_duration: durationStr,
        camera_roll_duration: durationStr,
        max_video_duration: durationStr,
        video_max_duration: durationStr,
        video_trim_max_duration: durationStr,
        trim_max_duration: durationStr,
        gold_max_duration: durationStr,
        goldMaxDuration: durationStr,
        max_file_size: "104857600",
        max_upload_bytes: "104857600",
        video_quality_mbps: "0.5",
        video_sound_enabled: "true",
        microphone_enabled: "true",
        camera_microphone_enabled: "true",
        audio_session_deactivation_enabled: "true",
        zoom_enabled: "true",
        upload_main: "false",
        upload_main_image_quality: "0.5",
        upload_main_image_size: "1440",
        upload_thumbnail_image_quality: "0.5",
        upload_thumbnail_image_size: "1020"
    });

    // ============================================================
    // 4. BẠN BÈ, GIỚI HẠN & ĐỀ XUẤT KẾT BẠN
    // ============================================================
    Object.assign(obj.entries, {
        max_friends_count: "999999",
        friend_limit_mode: "0",
        soft_friend_limit_threshold_count: "999999",
        show_friend_limit_on_cam: "false",
        signup_max_friends_count: "999999",
        celebrity_inbox_limit: "999999",
        friend_limit_geo_override: JSON.stringify({ experiments: {}, area_code_overrides: {} }),
        friends_sheet_locket_count_config: JSON.stringify({
            items: [
                { threshold: 0, icon_name: "heart" },
                { threshold: 1, icon_name: "heart.fill" },
                { threshold: 10, emoji: "🤍" },
                { threshold: 100, emoji: "💛" },
                { threshold: 500, emoji: "❤️‍🔥" },
                { threshold: 1000, emoji: "🌟🫶🌟" },
                { threshold: 2000, emoji: "✨💟✨" },
                { threshold: 5000, emoji: "⚡️😵‍💫⚡" },
                { threshold: 10000, emoji: "✨⚡️😱⚡✨" }
            ]
        }),
        friend_locket_count_config: JSON.stringify({
            items: [
                { threshold: 0, icon_name: "heart" },
                { threshold: 1, icon_name: "heart.fill" },
                { threshold: 10, emoji: "🤍" },
                { threshold: 100, emoji: "💛" },
                { threshold: 500, emoji: "❤️‍🔥" },
                { threshold: 1000, emoji: "✨💗✨" },
                { threshold: 2000, emoji: "✨️⭐️✨" },
                { threshold: 5000, emoji: "✨💎✨" },
                { threshold: 10000, emoji: "✨🔐💛✨" }
            ]
        }),
        new_friends_monitoring_enabled: "true",
        improved_friend_suggestions: "true",
        show_friend_suggestions_by_default: "true",
        emoji_friend_suggestions: "true",
        prompt_contact_permissions_on_search: "true",
        populate_phone_numbers_from_suggest_friends: "true",
        hide_friends_enabled: "true",
        hide_invite_links: "false",
        hide_skip_contacts: "true",
        show_all_contacts: "true",
        show_invite_suggestions: "true",
        show_no_friends_bottom_sheet: "false",
        signup_allow_skip_add_friends: "true"
    });

    // ============================================================
    // 5. MOMENTS, STREAK, CHAT & TƯƠNG TÁC
    // ============================================================
    try {
        var streak = JSON.parse(obj.entries.streak_config || "{}");
        streak.minimum_recovery_count = 0;
        streak.minimum_display_count = 0;
        obj.entries.streak_config = JSON.stringify(streak);
    } catch (e) {}

    Object.assign(obj.entries, {
        moment_views_enabled: "true",
        moment_views_v2: "true",
        record_moment_views: "true",
        notify_moment_views: "true",
        get_moment_views_as_cloud_function: "true",
        moment_reactions_v2: "true",
        chat_reactions_enabled: "true",
        conversation_reactions: "true",
        typing_indicators_enabled: "true",
        unsend_message_enabled: "true",
        reply_prototype_enabled: "true",
        messages_integration: "true",
        conversations_enabled: "true",
        fetch_moments_in_conversation: "true",
        hide_chat_button: "false",
        groups_enabled: "true",
        send_to_self_only_mode: "always_enabled",
        time_travel_rewind_v2_enabled: "true",
        calendar_delete_moment_enabled: "true",
        calendar_rewind_enabled: "false",
        locket_yearbook_story_sharing_encouraged: "true",
        rollcall_enabled: "true",
        rollcall_comment_actions: "true",
        rollcall_profile_button: "true",
        rollcall_prompt_export_after_share: "true",
        rollcall_confirm_skip_tagging: "false",
        rollcall_tap_to_tag_enabled: "false"
    });

    // ============================================================
    // 6. WIDGET, THÔNG BÁO & GIAO DIỆN (JOURNAL / PROFILE)
    // ============================================================
        Object.assign(obj.entries, {
        widget_frame_event_max_images: "5",
        android_widget_frame_event_enabled: "true",
        widget_badge_enabled: "true",
        widget_badge_v2: "true",
        widget_stale_state_enabled: "false",
        widget_last_sent_indicator: "false",
        widget_sync_token_reload_mode: "clearTokenNever",
        widget_frame_event: JSON.stringify({
            uid: "wukong2",
            url: "https://i.postimg.cc/HLVhNL9F/0d22da63-3607-479c-a0a6-228e39f949b9.png",
            use_local_time_zone: true,
            placement: "below",
            start_at: "2020-01-01T00:00:00",
            end_at: "2099-12-31T23:59:59"
        }),
        live_activity_onboarding: "true",
        live_activity_onboarding_variant: "friending",
        register_live_activity_push_to_start_token: "true",
        live_activity_remove_stale_start_token: "true",
        notification_preferences_live_activities: "true",
        notification_preferences: "true",
        notification_reply_body_visible: "true",
        prompt_notification_permissions_after_friending: "true",
        activity_bar_enabled: "true",
        journal_activity_bar_enabled: "true",
        journal_settings: JSON.stringify({
            debug_menu_enabled: false,
            focus_animation: true,
            compact_header: true,
            friends_button: true,
            reverse_scroll_direction: false,
            streak_visualization: true,
            streak_visualization_style: "gradient",
            streak_header_minimum_count: 0,
            streak_visualization_minimum_count: 2,
            overlay_indicators: { location: true, music: true, static_content: true, weather: true }
        }),
        qr_code_config: JSON.stringify({ profile_enabled: true, scanning_enabled: true }),
        custom_profile_pics: "true",
        profile_menu_v2_enabled: "true"
    });
    
    // ============================================================
    // 7. HỆ THỐNG, CACHE & STORAGE CDN
    // ============================================================
   Object.assign(obj.entries, {
        widget_frame_event_max_images: "10",
        android_widget_frame_event_enabled: "true",
        widget_badge_enabled: "true",
        widget_badge_v2: "true",
        widget_stale_state_enabled: "false",
        widget_last_sent_indicator: "false",
        widget_sync_token_reload_mode: "clearTokenNever",
        
        // Kích hoạt tính năng Custom Widget Frame trong Locket Gold
        custom_widget_frames: "enabled",
        custom_widget_frames_enabled: "true",
        
        // Cấu hình kho khung tĩnh VIP Gold tùy chỉnh
        widget_frames_config: JSON.stringify({
            enabled: true,
            allow_custom_frames: true,
            unlock_all_styles: true,
            default_style: "royal_gold_vip",
            styles: [
                {
                    id: "royal_gold_vip",
                    name: "👑 VIP Royal Gold",
                    border_style: "ornate_gold",
                    crown_badge: true,
                    badge_text: "VIP",
                    corner_radius: 28.0,
                    glow_effect: true,
                    glow_color: "#FFD700",
                    overlay_asset: "royal_crown_frame"
                }
            ]
        }),

        // Danh sách ID khung đè vào menu chọn widget
        widget_frame_styles: JSON.stringify([
            "royal_gold_vip",
            "gold_luxury",
            "classic"
        ]),

        // Cấu hình sự kiện / Seasonal Frames đè
        seasonal_frames_config: JSON.stringify({
            enabled: true,
            auto_rotate: false,
            override_default: true,
            current_season_theme: "royal_gold_vip"
        }),

        live_activity_onboarding: "true",
        live_activity_onboarding_variant: "friending",
        register_live_activity_push_to_start_token: "true",
        live_activity_remove_stale_start_token: "true",
        notification_preferences_live_activities: "true",
        notification_preferences: "true",
        notification_reply_body_visible: "true",
        prompt_notification_permissions_after_friending: "true",
        activity_bar_enabled: "true",
        journal_activity_bar_enabled: "true",
        
        journal_settings: JSON.stringify({
            debug_menu_enabled: false,
            focus_animation: true,
            compact_header: true,
            friends_button: true,
            reverse_scroll_direction: false,
            streak_visualization: true,
            streak_visualization_style: "gradient",
            streak_header_minimum_count: 0,
            streak_visualization_minimum_count: 2,
            overlay_indicators: { location: true, music: true, static_content: true, weather: true }
        }),
        
        qr_code_config: JSON.stringify({ profile_enabled: true, scanning_enabled: true }),
        custom_profile_pics: "true",
        profile_menu_v2_enabled: "true"
    });

    // ============================================================
    // 8. OVERLAY & CUSTOM CAPTIONS - one personalized caption
    // ============================================================
               Object.assign(obj.entries, {
                overlay_navigator_enabled: "true",
                overlays_v2_config: JSON.stringify({ suggestions_enabled: true }),
                captions_enabled: "true",
                music_caption_enabled: "true",
                music_caption_song_preview_enabled: "true",
                link_caption_link_enabled: "true",
                overlay_dynamic_captions: JSON.stringify([
                    "standard", "poll", "color_palette", "review", "music", "location",
                    "weather", "time", "streak", "star_sign", "party_time", "locket_count",
                    "good_morning", "goodnight", "ootd", "miss_you", "custom", "phunu_2010", "halloween_2026"
                ]),
                overlay_items: JSON.stringify([
                    {
                            "section": "🎨 General",
                            "items": [
                                    {
                                            "overlay_id": "caption:standard",
                                            "source": "local",
                                            "caption": {
                                                    "type": "standard"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:link",
                                            "source": "local",
                                            "caption": {
                                                    "type": "link"
                                            },
                                            "overlay_type": "caption"
                                    },
                                    {
                                            "overlay_id": "caption:review",
                                            "source": "local",
                                            "caption": {
                                                    "type": "review"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:music",
                                            "source": "local",
                                            "caption": {
                                                    "type": "music"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:location",
                                            "source": "local",
                                            "caption": {
                                                    "type": "location"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:weather",
                                            "source": "local",
                                            "caption": {
                                                    "type": "weather"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:time",
                                            "source": "local",
                                            "caption": {
                                                    "type": "time"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:streak",
                                            "source": "local",
                                            "caption": {
                                                    "type": "streak"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:star_sign",
                                            "source": "local",
                                            "caption": {
                                                    "type": "star_sign"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:poll",
                                            "source": "local",
                                            "caption": {
                                                    "type": "poll"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:color_palette",
                                            "source": "local",
                                            "caption": {
                                                    "type": "color_palette"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:live",
                                            "source": "local",
                                            "caption": {
                                                    "type": "live"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:locket_count",
                                            "source": "local",
                                            "caption": {
                                                    "type": "locket_count"
                                            }
                                    },
                                {
                                    "overlay_id": "caption:quote",
                                    "source": "local",
                                    "caption": {
                                        "type": "quote"
                                    },
                                    "sort_order": 10
                                },
                                {
                                    "overlay_id": "caption:breaking_news",
                                    "source": "local",
                                    "caption": {
                                        "type": "breaking_news"
                                    },
                                    "sort_order": 11
                                }
                            ]
                    },
                    {
                            "section": "🎨 Decorative by ThienPhu",
                            "items": [
                                    {
                                            "overlay_id": "caption:MinhHiep08",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#B8E7FF",
                                                                    "#A8F5D0",
                                                                    "#DCCBFF"
                                                            ]
                                                    },
                                                    "max_lines": 1,
                                                    "text": "💻 ThienPhu",
                                                    "text_color": "#183153",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:Hieon",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#B8E7FF",
                                                                    "#A8F5D0",
                                                                    "#DCCBFF"
                                                            ]
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Hieon",
                                                    "text_color": "#183153",
                                                    "type": "static_content"
                                            }
                                    },

                                    {
                                            "overlay_id": "caption:feeling_cute",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#F8BBD0",
                                                                    "#E91E63"
                                                    ]
                                                    },
                                                    "icon": {
                                                            "data": "🌷",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Feeling Cute",
                                                    "localized_text": {
                                                            "en": "Feeling Cute",
                                                            "vn": "Cảm thấy dthw"
                                                    },
                                                    "text_color": "#FFFFFFE5",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:cu",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FFD6A5",
                                                                    "#FFF1A8",
                                                                    "#FFC4D6"
                                                            ]
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Cu 🐎",
                                                    "text_color": "#633B24",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:tuat",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#2C1A0E",
                                                                    "#5D4037",
                                                                    "#D7A86E"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🐕",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Tuất",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:wedding_time",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FFE4E1",
                                                                    "#E73C7E"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💍",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Wedding Time!",
                                                    "localized_text": {
                                                            "en": "Wedding Time!",
                                                            "vn": "Đám cưới nè!"
                                                    },
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:cam_thay_hanh_phuc",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#EC407A",
                                                                    "#F8BBD0"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🇻🇳",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Cảm thấy hạnh phúc",
                                                    "localized_text": {
                                                            "en": "Feeling Happy",
                                                            "vn": "Cảm thấy hạnh phúc"
                                                    },
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:coffee_time",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#4E342E",
                                                                    "#8D6E63"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "☕",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Coffee Time!",
                                                    "localized_text": {
                                                            "en": "Coffee Time!",
                                                            "vn": "Giờ uống cà phê!"
                                                    },
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:snake_vibes",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#2E7D32",
                                                                    "#66BB6A"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🐍",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Snake Vibes",
                                                    "localized_text": {
                                                            "en": "Snake Vibes",
                                                            "vn": "Chất rắn"
                                                    },
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:mixue_time",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FFF9C4",
                                                                    "#F8BBD0"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🍦",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Mixue Time!",
                                                    "localized_text": {
                                                            "en": "Mixue Time!",
                                                            "vn": "Giờ Mixue!"
                                                    },
                                                    "text_color": "#000000E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:locket_time",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#ECEFF1",
                                                                    "#B3E5FC"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "📷",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Locket Time!",
                                                    "text_color": "#000000E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:cinema_time",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#1A237E",
                                                                    "#455A64"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🎬",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Cinema Time!",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:dating_time",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#E91E63",
                                                                    "#F44336"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💕",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Dating Time!",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:graduation_day",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#1A237E",
                                                                    "#283593"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🎓",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Happy Graduation Day!",
                                                    "localized_text": {
                                                            "en": "Happy Graduation Day!",
                                                            "vn": "Chúc mừng tốt nghiệp!"
                                                    },
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:shopping_time",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#B3E5FC",
                                                                    "#FFFFFF"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🛍️",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Shopping Time!",
                                                    "localized_text": {
                                                            "en": "Shopping Time!",
                                                            "vn": "Giờ mua sắm!"
                                                    },
                                                    "text_color": "#000000E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:dinner_time",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FFCCBC",
                                                                    "#FF8A80"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🍽️",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Dinner Time!",
                                                    "localized_text": {
                                                            "en": "Dinner Time!",
                                                            "vn": "Giờ ăn tối!"
                                                    },
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:chilling_time",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#E1BEE7",
                                                                    "#F8BBD0"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🌴",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Chilling Time!",
                                                    "localized_text": {
                                                            "en": "Chilling Time!",
                                                            "vn": "Giờ thư giãn!"
                                                    },
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    }
                            ]
                    },
                    {
                            "section": "🎨 Tình yêu & Cơm chó 💕",
                            "items": [
                                    {
                                            "overlay_id": "caption:em_nho_anhh",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FF6B81",
                                                                    "#FF8E9E",
                                                                    "#FFB3C6"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🥺",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "em nhớ anhh",
                                                    "text_color": "#8C1938",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:nho_anh_phien",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#F0B5CB",
                                                                    "#F6D0DF",
                                                                    "#DCCAF0"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🥺",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "nhớ anh tới mức hơi phiền",
                                                    "text_color": "#70445A",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:i_love_you",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FF8FAB",
                                                                    "#FFC2D1",
                                                                    "#FFE5EC"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💗",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "i love you",
                                                    "text_color": "#8A304F",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:yeu_cuc_dang",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#F2B5C8",
                                                                    "#F8D5D9",
                                                                    "#F6E5D2"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🎀",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "yêu cục dàng",
                                                    "text_color": "#754454",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:yeu_emmm",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#F2AFC6",
                                                                    "#F7C9D9",
                                                                    "#E5CFF4"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💗",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Yeu Emmm",
                                                    "text_color": "#70445C",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:yeu_anhhh",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#B8C9F2",
                                                                    "#D5DDF8",
                                                                    "#E8CFF0"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🫶",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Yeu Anhhh",
                                                    "text_color": "#414C72",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:baby_love",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FFB6C1",
                                                                    "#FF69B4",
                                                                    "#FF1493"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🧸",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Baby Love 💖",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:muon_duoc_om",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FF9A9E",
                                                                    "#FECFEF"
                                                    ]
                                                    },
                                                    "icon": {
                                                            "data": "🫂",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Muốn được ôm",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:cho_hun_mieng",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#F3AFC7",
                                                                    "#F8D0D8",
                                                                    "#F4C9BB"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "😘",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "cho hun miếng coi",
                                                    "text_color": "#754252",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:me_anh_me_ngu",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#C4C8EF",
                                                                    "#DED3F4",
                                                                    "#EBCDE4"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💤",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "mê anh hơn mê ngủ",
                                                    "text_color": "#4F4770",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:be_be_can_do",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FF8FAB",
                                                                    "#FFC2D1",
                                                                    "#FFE5EC"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🎀",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "em bé cần được dỗ",
                                                    "text_color": "#812D4A",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:iu_thi_noi",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FFD166",
                                                                    "#FFE8A3",
                                                                    "#FFF3D0"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🤭",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "iu thì nói, đừng có ngại",
                                                    "text_color": "#704510",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:iu_hong_thi_bao",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FF6B6B",
                                                                    "#FF9999",
                                                                    "#FFD1C9"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🎀",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "iu hong thì bảo",
                                                    "text_color": "#812626",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:anh_thuong_em",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#A0C4FF",
                                                                    "#BDE0FE",
                                                                    "#DFF3FF"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🥹",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "anh có thương em thiệt hong",
                                                    "text_color": "#23466F",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:yeu_em_nhiem_vu",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#B7E4C7",
                                                                    "#D8F3DC",
                                                                    "#F0FFF1"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🫡",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "yêu em là nhiệm vụ cả đời",
                                                    "text_color": "#24563A",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:crush_nhin",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#CDB4DB",
                                                                    "#E2CFEA",
                                                                    "#F3E5F5"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🫠",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "crush nhìn em một cái là xong",
                                                    "text_color": "#593B68",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:ngoai_le_cua_em",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#80CBC4",
                                                                    "#B2DFDB",
                                                                    "#E0F2F1"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🫶",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "anh là ngoại lệ của em",
                                                    "text_color": "#205953",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:dang_ban_tuong_tu",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#1A2980",
                                                                    "#26D0CE"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💭",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Đang bận tương tư",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:mac_bay_tinh_yeu",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#EE9CA7",
                                                                    "#FFDDE1"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💘",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Mắc bẫy tình yêu",
                                                    "text_color": "#000000E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:minh_cuoi_nhau",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#F0B8CD",
                                                                    "#F7D4DF",
                                                                    "#E7C9EF"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💍",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "hông ấy mình cưới nhau đi",
                                                    "text_color": "#70465B",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:wedding_time",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FFE4E1",
                                                                    "#E73C7E"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💍",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Wedding Time!",
                                                    "localized_text": {
                                                            "en": "Wedding Time!",
                                                            "vn": "Đám cưới nè!"
                                                    },
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:dating_time",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#E91E63",
                                                                    "#F44336"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💕",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Dating Time!",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:tuong_love_hoa_ra_lop",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#C9184A",
                                                                    "#FF4D6D",
                                                                    "#FFB3C6"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "❤️🩹",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Tưởng love hoá ra lốp",
                                                    "text_color": "#64152F",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:cam_thay_hanh_phuc",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#EC407A",
                                                                    "#F8BBD0"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🇻🇳",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Cảm thấy hạnh phúc",
                                                    "localized_text": {
                                                            "en": "Feeling Happy",
                                                            "vn": "Cảm thấy hạnh phúc"
                                                    },
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    }
                            ]
                    },
                    {
                            "section": "🎨 Holiday Caption",
                            "items": [
                                    {
                                            "overlay_id": "caption:halloween_2026",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#150804",
                                                                    "#C8540D"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🎃",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Halloween",
                                                    "localized_text": {
                                                            "en": "Halloween",
                                                            "vn": "Halloween"
                                                    },
                                                    "text_color": "#FFB182",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:autumn_2026",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FFE0A0",
                                                                    "#F6A53A"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🍂",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Xin chào Mùa Thu",
                                                    "localized_text": {
                                                            "en": "Xin chào Mùa Thu",
                                                            "vn": "Xin chào Mùa Thu"
                                                    },
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:christmas_eve_2026",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#2FA85F",
                                                                    "#176B3A"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🕯️",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Giáng sinh an lành",
                                                    "localized_text": {
                                                            "en": "Giáng sinh an lành",
                                                            "vn": "Giáng sinh an lành"
                                                    },
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:christmas_day_2026",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#E53935",
                                                                    "#A81818"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🎄",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Giáng sinh an lành",
                                                    "localized_text": {
                                                            "en": "Giáng sinh an lành",
                                                            "vn": "Giáng sinh an lành"
                                                    },
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:new_years_eve_2026",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FFC64B",
                                                                    "#FFEDBF"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🥂",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Xin chào 2027!",
                                                    "localized_text": {
                                                            "en": "Xin chào 2027!",
                                                            "vn": "Xin chào 2027!"
                                                    },
                                                    "text_color": "#643F00",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:new_years_day_2027",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#3B00EC",
                                                                    "#823FFF"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💫",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Xin chào 2027!",
                                                    "localized_text": {
                                                            "en": "Xin chào 2027!",
                                                            "vn": "Xin chào 2027!"
                                                    },
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:new_years_day_2027_alternate",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FF0062",
                                                                    "#FF783F"
                                                            ]
                                                    },
                                                    "max_lines": 1,
                                                    "text": "2027",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                {
                                    "overlay_id": "caption:photo_halloween_2026",
                                    "source": "remote",
                                    "caption": {
                                        "background": {
                                            "colors": [
                                                "#321002",
                                                "#441500",
                                                "#9F3D05",
                                                "#C33D02"
                                            ]
                                        },
                                        "icon": {
                                            "type": "image",
                                            "data": "https://storage.googleapis.com/locket-public/journal_calendar_assets/holiday_indicators/halloween_indicator%403x.png",
                                            "source": "url"
                                        },
                                        "max_lines": 1,
                                        "text": "Halloween",
                                        "text_color": "#FFB182",
                                        "type": "static_content"
                                    }
                                },
                                {
                                    "overlay_id": "caption:photo_autumn_2026",
                                    "source": "remote",
                                    "caption": {
                                        "background": {
                                            "colors": [
                                                "#FFD68B",
                                                "#FFCE7B",
                                                "#FEAD39",
                                                "#FDA821"
                                            ]
                                        },
                                        "icon": {
                                            "data": "🍂",
                                            "type": "emoji"
                                        },
                                        "max_lines": 1,
                                        "text": "Xin chào Mùa Thu",
                                        "text_color": "#FFFFFF",
                                        "type": "static_content"
                                    }
                                },
                                {
                                    "overlay_id": "caption:election_day_vote_2026",
                                    "source": "remote",
                                    "caption": {
                                        "background": {
                                            "colors": [
                                                "#5158D5",
                                                "#6757CA",
                                                "#D14194",
                                                "#E63B87"
                                            ]
                                        },
                                        "icon": {
                                            "data": "🇺🇸",
                                            "type": "emoji"
                                        },
                                        "max_lines": 1,
                                        "text": "VOTE",
                                        "text_color": "#FFFFFF",
                                        "type": "static_content"
                                    },
                                    "region": [
                                        "VN"
                                    ]
                                },
                                {
                                    "overlay_id": "caption:election_day_i_voted_2026",
                                    "source": "remote",
                                    "caption": {
                                        "background": {
                                            "colors": [
                                                "#F6F8FC",
                                                "#EEEFF8",
                                                "#C4D1E3",
                                                "#C1C9E2"
                                            ]
                                        },
                                        "icon": {
                                            "data": "🗳️",
                                            "type": "emoji"
                                        },
                                        "max_lines": 1,
                                        "text": "I voted!",
                                        "text_color": "#000000",
                                        "type": "static_content"
                                    },
                                    "region": [
                                        "VN"
                                    ]
                                },
                                {
                                    "overlay_id": "caption:diwali_2026",
                                    "source": "remote",
                                    "caption": {
                                        "background": {
                                            "colors": [
                                                "#FF8600",
                                                "#FF8B00",
                                                "#FFC25B",
                                                "#FEC670"
                                            ]
                                        },
                                        "icon": {
                                            "data": "🪔",
                                            "type": "emoji"
                                        },
                                        "max_lines": 1,
                                        "text": "Diwali",
                                        "text_color": "#731B0D",
                                        "type": "static_content"
                                    },
                                    "region": [
                                        "VN"
                                    ]
                                },
                                {
                                    "overlay_id": "caption:veterans_day_2026",
                                    "source": "remote",
                                    "caption": {
                                        "background": {
                                            "colors": [
                                                "#FBF7F4",
                                                "#F9F5F2",
                                                "#F0E3DE",
                                                "#EBE1DB"
                                            ]
                                        },
                                        "icon": {
                                            "data": "🇺🇸",
                                            "type": "emoji"
                                        },
                                        "max_lines": 1,
                                        "text": "Thank You Veterans",
                                        "text_color": "#2C5E8F",
                                        "type": "static_content"
                                    },
                                    "region": [
                                        "VN"
                                    ]
                                },
                                {
                                    "overlay_id": "caption:thanksgiving_2026",
                                    "source": "remote",
                                    "caption": {
                                        "background": {
                                            "colors": [
                                                "#CBA365",
                                                "#C79C5F",
                                                "#A26C3C",
                                                "#A06A3A"
                                            ]
                                        },
                                        "icon": {
                                            "data": "🦃",
                                            "type": "emoji"
                                        },
                                        "max_lines": 1,
                                        "text": "Happy Thanksgiving!",
                                        "text_color": "#FFFFFF",
                                        "type": "static_content"
                                    },
                                    "region": [
                                        "VN"
                                    ]
                                },
                                {
                                    "overlay_id": "caption:black_friday_2026",
                                    "source": "remote",
                                    "caption": {
                                        "background": {
                                            "colors": [
                                                "#1F1F1F",
                                                "#230D19",
                                                "#483943",
                                                "#3F3F3F"
                                            ]
                                        },
                                        "icon": {
                                            "data": "🛍️",
                                            "type": "emoji"
                                        },
                                        "max_lines": 1,
                                        "text": "Black Friday",
                                        "text_color": "#FFFFFF",
                                        "type": "static_content"
                                    },
                                    "region": [
                                        "VN"
                                    ]
                                },
                                {
                                    "overlay_id": "caption:hanukkah_2026",
                                    "source": "remote",
                                    "caption": {
                                        "background": {
                                            "colors": [
                                                "#263BC4",
                                                "#4B3CB5",
                                                "#6C3EC2",
                                                "#3F5DF7"
                                            ]
                                        },
                                        "icon": {
                                            "data": "🕎",
                                            "type": "emoji"
                                        },
                                        "max_lines": 1,
                                        "text": "Happy Hanukkah!",
                                        "text_color": "#FFFFFF",
                                        "type": "static_content"
                                    },
                                    "region": [
                                        "VN"
                                    ]
                                },
                                {
                                    "overlay_id": "caption:photo_christmas_eve_2026",
                                    "source": "remote",
                                    "caption": {
                                        "background": {
                                            "colors": [
                                                "#00A45A",
                                                "#00A04B",
                                                "#477D64",
                                                "#00783A"
                                            ]
                                        },
                                        "icon": {
                                            "data": "🕯️",
                                            "type": "emoji"
                                        },
                                        "max_lines": 1,
                                        "text": "Christmas Eve",
                                        "text_color": "#FFFFFF",
                                        "type": "static_content"
                                    },
                                    "region": [
                                        "VN"
                                    ]
                                },
                                {
                                    "overlay_id": "caption:christmas_eve_2026_v22",
                                    "source": "remote",
                                    "caption": {
                                        "background": {
                                            "colors": [
                                                "#00A652",
                                                "#00A053",
                                                "#38785A",
                                                "#01753E"
                                            ]
                                        },
                                        "icon": {
                                            "data": "🕯️",
                                            "type": "emoji"
                                        },
                                        "max_lines": 1,
                                        "text": "Giáng sinh an lành",
                                        "text_color": "#FFFFFF",
                                        "type": "static_content"
                                    }
                                },
                                {
                                    "overlay_id": "caption:photo_christmas_day_2026",
                                    "source": "remote",
                                    "caption": {
                                        "background": {
                                            "colors": [
                                                "#F31625",
                                                "#EC0C23",
                                                "#C50315",
                                                "#BE020D"
                                            ]
                                        },
                                        "icon": {
                                            "data": "🎄",
                                            "type": "emoji"
                                        },
                                        "max_lines": 1,
                                        "text": "Merry Christmas!",
                                        "text_color": "#FFFFFF",
                                        "type": "static_content"
                                    },
                                    "region": [
                                        "VN"
                                    ]
                                },
                                {
                                    "overlay_id": "caption:christmas_eve_2026_v24",
                                    "source": "remote",
                                    "caption": {
                                        "background": {
                                            "colors": [
                                                "#F8162C",
                                                "#EF0B2A",
                                                "#CB0012",
                                                "#C0010F"
                                            ]
                                        },
                                        "icon": {
                                            "data": "🎄",
                                            "type": "emoji"
                                        },
                                        "max_lines": 1,
                                        "text": "Giáng sinh an lành",
                                        "text_color": "#FFFFFF",
                                        "type": "static_content"
                                    }
                                },
                                {
                                    "overlay_id": "caption:no_memory",
                                    "source": "remote",
                                    "caption": {
                                        "background": {
                                            "image": {
                                                "type": "image",
                                                "data": "https://public.locketcamera.com/locket-public/overlays/forgotten_island/forgotten_island_bg.png",
                                                "source": "url"
                                            },
                                            "colors": [
                                                "#640C89",
                                                "#6F21A2",
                                                "#4837D5",
                                                "#2050E6"
                                            ]
                                        },
                                        "max_lines": 1,
                                        "text": "NO MEMORY LEFT BEHIND",
                                        "text_color": "#FFFFFFE6",
                                        "type": "static_content"
                                    }
                                }
                            ]
                    },
                    {
                            "section": "🎨 Decorative by Locket",
                            "items": [
                                    {
                                            "overlay_id": "caption:toi_nho_em",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FFFFFF",
                                                                    "#6D9EEB"
                                                            ]
                                                    },
                                                    "max_lines": 1,
                                                    "text": "보고 싶어 🥺",
                                                    "text_color": "#000000E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:party_time",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#5EFFF5",
                                                                    "#FCFF57"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🪩",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Party Time!",
                                                    "text_color": "#000000E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:good_morning",
                                            "source": "remote",
                                            "daily_start_hour": 5,
                                            "daily_end_hour": 10,
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#EF7402",
                                                                    "#EABF0F"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "☀️",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Good morning",
                                                    "text_color": "#FFFFFFE5",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:goodnight",
                                            "source": "remote",
                                            "daily_start_hour": 19.5,
                                            "daily_end_hour": 24,
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#370C6F",
                                                                    "#575CD4"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🌙",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Goodnight",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:ootd",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FFFFFF",
                                                                    "#DBDBDB"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🕶",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "OOTD",
                                                    "text_color": "#101010E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:miss_you",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#EC0C00",
                                                                    "#FF493F"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🥰",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Miss you",
                                                    "text_color": "#FFFFFFDB",
                                                    "type": "static_content"
                                            }
                                    },
                                {
                                    "overlay_id": "caption:photo_miss_you",
                                    "source": "remote",
                                    "caption": {
                                        "background": {
                                            "colors": [
                                                "#D40000",
                                                "#E20000",
                                                "#FF161D",
                                                "#FD2226"
                                            ]
                                        },
                                        "icon": {
                                            "data": "🥰",
                                            "type": "emoji"
                                        },
                                        "max_lines": 1,
                                        "text": "Miss you",
                                        "text_color": "#FFFFFFDB",
                                        "type": "static_content"
                                    }
                                },
                                {
                                    "overlay_id": "caption:photo_ootd",
                                    "source": "remote",
                                    "caption": {
                                        "background": {
                                            "colors": [
                                                "#C8C9C6",
                                                "#DCDCDC",
                                                "#E3E3E3",
                                                "#E0E0E0"
                                            ]
                                        },
                                        "icon": {
                                            "data": "🕶",
                                            "type": "emoji"
                                        },
                                        "max_lines": 1,
                                        "text": "OOTD",
                                        "text_color": "#101010E6",
                                        "type": "static_content"
                                    }
                                }
                            ]
                    },
                    
                    {
                            "section": "🎨 Độc lạ đời sống",
                            "items": [
                                    {
                                            "overlay_id": "caption:xin_vinh_biet_cu",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#232526",
                                                                    "#414345"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🕯️",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Xin vĩnh biệt cụ",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:chay_ngay_di",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#D31027",
                                                                    "#EA384D"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🏃💨",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Chạy ngay đi",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:luc_nao_co_tien_thi_moi_di_a",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#0F2027",
                                                                    "#203A43",
                                                                    "#2C5364"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💸",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Lúc nào có tiền thì mới đi á",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:cu_tu_tu_khoai_se_nhu",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#56AB2F",
                                                                    "#A8E063"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🥔",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Cứ từ từ khoai sẽ nhừ",
                                                    "text_color": "#000000E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:kiem_tra_nhan_pham",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#654EA3",
                                                                    "#EAAFC8"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🎲",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Kiểm tra nhân phẩm",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:doc_so_tai_khoan",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#1E90FF",
                                                                    "#00D4FF"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💳",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "đọc số tài khoản",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:ai_so_thi_di_ve",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#B71C1C",
                                                                    "#FF5722"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🏃",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "ai sợ thì đi về",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:con_cai_nit",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#D7CCC8",
                                                                    "#8D6E63"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🧶",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "còn cái nịt",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:canh_bao_co_hat",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#9C27B0",
                                                                    "#E91E63"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🎤",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "cảnh báo có hát",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:than_chua_ma_don",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#607D8B",
                                                                    "#37474F"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "😔",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Thân chưa mà dỡn",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:ai_muon",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#E91E63",
                                                                    "#F44336"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🤔",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Ai mượn?",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:hay_ra_de_qua_a",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FFF59D",
                                                                    "#80DEEA"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🥺",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Hay ra dẻ quá à!",
                                                    "text_color": "#000000E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:giam_suc_manh_con_tuong",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#4CAF50",
                                                                    "#00BCD4"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🎮",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Giảm sức mạnh con tướng",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:mac_co_qua_hai_oi",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FFB74D",
                                                                    "#F8BBD0"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "😭",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Mắc cỡ quá hai ơi",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:minh_la_lop",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#263238",
                                                                    "#455A64"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🛞",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Mình là lốp",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:dep_trai_co_gi_sai",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FF5722",
                                                                    "#FFC107"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "😎",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Đẹp trai có gì sai",
                                                    "text_color": "#000000E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:mong_ton_hoa_sen",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#D8B4E2",
                                                                    "#F8BBD0"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🪷",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Mong tôn hoa sen thấy cảnh này",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:dam_nhau_khong",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#E53935",
                                                                    "#FF7043"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🥊",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "đấm nhau không",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:sieu_cap_ba_khi",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#EC407A",
                                                                    "#F44336"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🐉",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "siêu cấp bá khí",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:du_an_ma",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#263238",
                                                                    "#455A64"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "👻",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "dự án ma",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:doi_roi",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FF5F6D",
                                                                    "#FFC371"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "😤",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Dỗi rồi",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:dang_ban_tuong_tu",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#1A2980",
                                                                    "#26D0CE"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💭",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Đang bận tương tư",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:mo_hon_nhung_tam_hien",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FFB75E",
                                                                    "#ED8F03"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🐤",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Mỏ hỗn nhưng tâm hiền",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:muon_duoc_om",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FF9A9E",
                                                                    "#FECFEF"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🫂",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Muốn được ôm",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    }
                            ]
                    },
                    {
                            "section": "🎨 Trend TikTok (36 Caption)",
                            "items": [
                                    {
                                            "overlay_id": "caption:hoi_chieu_troi_mua",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#546E7A",
                                                                    "#263238"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🌧️",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Hồi chiều trời mưa...",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:con_vien_la_lan",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#12C2E9",
                                                                    "#F64F59"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🍂",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "côn viên lá làn",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:gian_dang_iu_hong",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#3E2723",
                                                                    "#6D4C41",
                                                                    "#A1887F"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🪳",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Gián đáng iu hong",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:nau_xoi",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#7B1FA2",
                                                                    "#E91E63",
                                                                    "#FFB74D"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🙀",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Nấu xói",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:co_tien_lam_phien_thien_ha",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#0F0C29",
                                                                    "#302B63",
                                                                    "#F7971E",
                                                                    "#FFD200"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💰",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Có tiền làm phiền thiên hạ",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:nguoi_im_lang_gap_nguoi_hay_noi",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#232526",
                                                                    "#414345",
                                                                    "#6C7A89",
                                                                    "#B0BEC5"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🤐",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Người im lặng gặp người hay nói",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:roi_let_luon",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FF9A9E",
                                                                    "#FECFEF",
                                                                    "#FBC2EB",
                                                                    "#A6C1EE"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💅",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "rồi lét luôn",
                                                    "text_color": "#000000E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:roi_gay_luon",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FF6EC7",
                                                                    "#7873F5",
                                                                    "#4ADEDE",
                                                                    "#FFE66D"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🌈",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "rồi gay luôn",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:tuyet_doi_khong_nghe",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FF416C",
                                                                    "#FF4B2B"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🙉",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Tuyệt đối không nghe",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:cha_nay_tu_luyen_ghe",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FFDEE9",
                                                                    "#B5FFFC",
                                                                    "#FAD0C4",
                                                                    "#FFD1FF"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🪞",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Cha này tự luyến ghê",
                                                    "text_color": "#000000E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:co_bien_co_bien",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FF512F",
                                                                    "#F09819",
                                                                    "#FFD200"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🚨",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Có biến có biến",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:hong_drama",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#8A2387",
                                                                    "#E94057",
                                                                    "#F27121"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🍿",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Hóng drama",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:cuoi_vcl_m_oi",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#F7971E",
                                                                    "#FFD200",
                                                                    "#FFEE58"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "😂",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Cười vcl m oi",
                                                    "text_color": "#000000E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:vl_m_oi",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#1F1C2C",
                                                                    "#928DAB",
                                                                    "#C9D6FF"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "😳",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "vl m ơi?",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:noi_het_bi_mat_thi_co_yeu_hong",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#EE9CA7",
                                                                    "#FFDDE1",
                                                                    "#C6FFDD",
                                                                    "#FBD786"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🤫",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Nói hết bị mật thì có yêu hong",
                                                    "text_color": "#000000E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:flex_den_hoi_tho_cuoi",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#F7971E",
                                                                    "#FFD200"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💎",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Flex đến hơi thở cuối",
                                                    "text_color": "#000000E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:overthinking_vai_chuong",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#2C3E50",
                                                                    "#4CA1AF"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🤯",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Overthinking vai chưởng",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:chan_bo_may_di",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#870000",
                                                                    "#190A05"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🙄",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Chan bố mày đi",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:oach_xa_lach",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#11998E",
                                                                    "#38EF7D"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🥬",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "oách xà lách",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:lai_phai_lo",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FBD3E9",
                                                                    "#BB377D",
                                                                    "#6A0572"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💔",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "lại phải lọ",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:ua_alo_1",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#8E2DE2",
                                                                    "#4A00E0"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "📞",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Ủa alo",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:ke_chuyen_nghe_choi",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#8A2387",
                                                                    "#E94057"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🍿",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Kể chuyện nghe chơi",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:hom_nay_toi_buon",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#141E30",
                                                                    "#243B55"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🥀",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "hôm nay tôi buồn",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:xinh_dep_tuyet_voi",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FC5C7D",
                                                                    "#6A82FB"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💅",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Xinh đẹp tuyệt vời",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:tram_cam_nhe",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#1F1C2C",
                                                                    "#928DAB"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🫠",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Trầm cảm nhẹ",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:chua_du_wow",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FF5349",
                                                                    "#EB0C00"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "⭐",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Chưa đủ wow",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:boc_trung_sit_rit",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#9C27B0",
                                                                    "#7B1FA2"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🎁",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Bóc trúng sít rịt",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:hen_lam_moi_xui_duoc_vay_a",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#00BCD4",
                                                                    "#0097A7"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "😅",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Hên lắm mới xui được vậy á",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:ra_duong_ne_moi_anh",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#2196F3",
                                                                    "#1976D2"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "👤",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Ra đường nể mỗi anh",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:cung_cung_di",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FFC107",
                                                                    "#FFA000"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🚀",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Cũng cứng đi",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:tuyet_doi_dien_anh",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#455A64",
                                                                    "#263238"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "📷",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Tuyệt đối điện ảnh",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:du_ba_khi_chua",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FF5722",
                                                                    "#E64A19"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "⚡",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Đủ bá khí chưa",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:ua_alo_2",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#9C27B0",
                                                                    "#7B1FA2"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "❓",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Ủa alo?",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:cai_gi_vay_troi",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#F44336",
                                                                    "#D32F2F"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "❗",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Cái gì vậy trời",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:nay_la_het_cuu",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#607D8B",
                                                                    "#455A64"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "❌",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Này là hết cứu",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:qua_la_dien_anh",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#26A69A",
                                                                    "#00897B"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "📷",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Quá là điện ảnh",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    }
                            ]
                    },
                    {
                            "section": "🎨 Gen Z Life 🩻",
                            "items": [
                                    {
                                            "overlay_id": "caption:hao_han",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#114357",
                                                                    "#F29492"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🗡️",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Hảo hán",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:cam_lanh",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#2193B0",
                                                                    "#6DD5ED"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🤧",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Cảm lạnh",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:bat_luc",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#2C3E50",
                                                                    "#3498DB"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🏳️",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Bất lực",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:xin_lui_duoc_chua",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#F6D365",
                                                                    "#FDA085"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🥺",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Xin lũi được chưa",
                                                    "text_color": "#000000",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:rot_nuoc_mat",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#1CB5E0",
                                                                    "#000046"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "😭",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Rớt nước mắt",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:guc_nga",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#3A1C71",
                                                                    "#D76D77"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "📉",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Gục ngã",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:tien_dinh",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#C33764",
                                                                    "#1D2671"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🌪️",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Tiền đình",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:che_manh",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FF4E50",
                                                                    "#F9D423"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "👎",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Chê mạnh",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:xinh_gai_an_phim_1",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#F77062",
                                                                    "#FE5196"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💅",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Xinh gái ấn phím 1",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:di_lam_vi_dam_me",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FDC830",
                                                                    "#F37335"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🤡",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Đi làm vì đam mê",
                                                    "text_color": "#FFFFFF",
                                                    "type": "static_content"
                                            }
                                    }
                            ]
                    },
                    {
                            "section": "🎨 Meme vui nhộn",
                            "items": [
                                    {
                                            "overlay_id": "caption:cuoi_xiu",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FFEB3B",
                                                                    "#FF9800"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "😎",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Cười xỉu",
                                                    "text_color": "#000000E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:toang_that_roi",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#F44336",
                                                                    "#B71C1C"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🐉",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Toang thật rồi",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:toi_roi_toi_roi",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#673AB7",
                                                                    "#512DA8"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "❗",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Tới rồi tới rồi",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:khong_the_tin_noi",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#00BCD4",
                                                                    "#0097A7"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "❓",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Không thể tin nổi",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    }
                            ]
                    },
                    {
                            "section": "🎨 Đời sống",
                            "items": [
                                    {
                                            "overlay_id": "caption:ngay_moi_vui_ve",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#4CAF50",
                                                                    "#2E7D32"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "☀️",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Ngày mới vui vẻ",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:ngu_ngon",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#3F51B5",
                                                                    "#1A237E"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🌙",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Ngủ ngon",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:an_com_chua",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FF9800",
                                                                    "#F57C00"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🍽️",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Ăn cơm chưa?",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:di_choi_khong",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#E91E63",
                                                                    "#C2185B"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "✈️",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Đi chơi không?",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    }
                            ]
                    },
                    {
                            "section": "🎨 Gen Z Slay",
                            "items": [
                                    {
                                            "overlay_id": "caption:tinh_hoa_hoi_tu",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FFD700",
                                                                    "#FF8C00"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "✨",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Tinh hoa hội tụ",
                                                    "text_color": "#000000E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:phu_tinh_khong_phu_ban",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#8E2DE2",
                                                                    "#4A00E0"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🕶️",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Phụ tình không phụ bản",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:ngoan_xinh_yeu",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FFAFBD",
                                                                    "#FFC3A0"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🌸",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Ngoan xinh yêu của ai?",
                                                    "text_color": "#000000E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:nhin_la_biet_uy_tin",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#2980B9",
                                                                    "#2C3E50"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "👌",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Nhìn là biết uy tín",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    }
                            ]
                    },
                    {
                            "section": "🎨 Bất ổn & Khó đỡ",
                            "items": [
                                    {
                                            "overlay_id": "caption:luon_vui_tuoi",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#00F2FE",
                                                                    "#4FACFE"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🤡",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Luôn vui tươi",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:bat_on_that_su",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#636363",
                                                                    "#A2AB58"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🫠",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Bất ổn thật sự",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:khong_cam_xuc",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#434343",
                                                                    "#000000"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🗿",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Không cảm xúc",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:phu_huynh_dung_xem",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#FF0844",
                                                                    "#FFB199"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🙈",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Phụ huynh đừng xem",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    }
                            ]
                    },
                    {
                            "section": "🎨 Check VAR & Hóng hớt",
                            "items": [
                                    {
                                            "overlay_id": "caption:check_var",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#11998E",
                                                                    "#38EF7D"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "📺",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Check VAR liền",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:qua_nhieu_su_de_thuong",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#F38181",
                                                                    "#FCE38A"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🎀",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Quá nhiều sự dễ thương",
                                                    "text_color": "#000000E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:mac_bay_tinh_yeu",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#EE9CA7",
                                                                    "#FFDDE1"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💘",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Mắc bẫy tình yêu",
                                                    "text_color": "#000000E6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:song_gio_phu_doi_trai",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#3A1C71",
                                                                    "#D76D77"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🌪️",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Sóng gió phủ đời trai",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    }
                            ]
                    },
                    {
                            "section": "🎨 Góc Deadline & Đi Làm",
                            "items": [
                                    {
                                            "overlay_id": "caption:deadline_ruot",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#ED213A",
                                                                    "#93291E"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🔥",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Deadline dí tụt quần",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:ca_o_ran_doc",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#0F2027",
                                                                    "#1B5E20",
                                                                    "#66BB6A"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "🐍",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Cả ổ rắn độc",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:tien_dau_ma_tieu",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#11998E",
                                                                    "#38EF7D"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "💸",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Tiền đâu mà tiêu",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    },
                                    {
                                            "overlay_id": "caption:nghien_cuu_khoa_hoc",
                                            "source": "remote",
                                            "caption": {
                                                    "background": {
                                                            "colors": [
                                                                    "#0F2027",
                                                                    "#2C5364"
                                                            ]
                                                    },
                                                    "icon": {
                                                            "data": "☕",
                                                            "type": "emoji"
                                                    },
                                                    "max_lines": 1,
                                                    "text": "Cần nạp cafein gấp",
                                                    "text_color": "#FFFFFFE6",
                                                    "type": "static_content"
                                            }
                                    }
                            ]
                    },
                    {
                        "section": "🎨 Decorative by Duy Vinh",
                        "items": [
                            {
                                "overlay_id": "caption:duyvinh09",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#A5EDF7",
                                            "#A4EFED",
                                            "#C1DEF0",
                                            "#CFD6F6"
                                        ]
                                    },
                                    "icon": {
                                        "data": "tortoise.fill",
                                        "type": "sf_symbol",
                                        "color": "#183153"
                                    },
                                    "max_lines": 1,
                                    "text": "duyvinh09",
                                    "text_color": "#183153",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_cu",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#FFD99B",
                                            "#FEDB9C",
                                            "#FFCFB9",
                                            "#FFC9CA"
                                        ]
                                    },
                                    "max_lines": 1,
                                    "text": "Cu 🐎",
                                    "text_color": "#633B24",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_tuat",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#3D231A",
                                            "#7D5B4B",
                                            "#AA7752",
                                            "#C5905B"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🐕",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Tuất",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_snake_vibes",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#008730",
                                            "#068F36",
                                            "#34A54B",
                                            "#39B658"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🐍",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Snake Vibes",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_du_an_ma",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#29383E",
                                            "#2F3843",
                                            "#3A535D",
                                            "#3F5565"
                                        ]
                                    },
                                    "icon": {
                                        "data": "👻",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "dự án ma",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:love_vietnam",
                                "source": "remote",
                                "alt_text": "Tôi yêu Việt Nam",
                                "caption": {
                                    "background": {
                                        "image": {
                                            "type": "image",
                                            "data": "star_sign_background",
                                            "source": "local"
                                        },
                                        "colors": [
                                            "#ED0002",
                                            "#C73B3F",
                                            "#EF0000",
                                            "#EE0305"
                                        ]
                                    },
                                    "icon": {
                                        "type": "image",
                                        "data": "https://storage.googleapis.com/locket-public/journal_calendar_assets/holiday_indicators/valentines_indicator%403x.png",
                                        "source": "url"
                                    },
                                    "max_lines": 1,
                                    "text": "Tôi yêu Việt Nam",
                                    "text_color": "#FFFF00",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:film_diary",
                                "source": "remote",
                                "alt_text": "Một ngày rất chill",
                                "caption": {
                                    "background": {
                                        "image": {
                                            "type": "image",
                                            "data": "https://public.locketcamera.com/locket-public/gold_promos/gold_promo_camera_roll.png",
                                            "source": "url"
                                        },
                                        "colors": [
                                            "#8C9166",
                                            "#585B38",
                                            "#927266",
                                            "#27312B"
                                        ]
                                    },
                                    "icon": {
                                        "type": "image",
                                        "data": "https://public.locketcamera.com/locket-public/journal_calendar_assets/holiday_indicators/st_patricks_indicator%403x.png",
                                        "source": "url"
                                    },
                                    "max_lines": 1,
                                    "text": "Một ngày rất chill",
                                    "text_color": "#FFFDD0",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:strangers",
                                "source": "remote",
                                "alt_text": "Người lạ",
                                "caption": {
                                    "background": {
                                        "image": {
                                            "type": "image",
                                            "data": "https://public.locketcamera.com/locket-public/gold_promos/gold_promo_views.png",
                                            "source": "url"
                                        },
                                        "colors": [
                                            "#363336",
                                            "#A7A2A6",
                                            "#512E26",
                                            "#443D3B"
                                        ]
                                    },
                                    "icon": {
                                        "data": "eye.fill",
                                        "type": "sf_symbol",
                                        "color": "#0A84FF"
                                    },
                                    "max_lines": 1,
                                    "text": "Người lạ",
                                    "text_color": "#FFFFFF",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:genz_flex",
                                "source": "remote",
                                "alt_text": "Mood: Chill",
                                "caption": {
                                    "background": {
                                        "image": {
                                            "type": "image",
                                            "data": "https://public.locketcamera.com/locket-public/gold_promos/gold_promo_widgets.png",
                                            "source": "url"
                                        },
                                        "colors": [
                                            "#73654A",
                                            "#251E05",
                                            "#5C422D",
                                            "#735944"
                                        ]
                                    },
                                    "icon": {
                                        "data": "camera.fill",
                                        "type": "sf_symbol",
                                        "color": "#FF007F"
                                    },
                                    "max_lines": 1,
                                    "text": "Mood: Chill 💅",
                                    "text_color": "#FFFFFF",
                                    "type": "static_content"
                                }
                            }
                        ]
                    },
                    {
                        "section": "🎨 Gen Z & Flex 💅",
                        "items": [
                            {
                                "overlay_id": "caption:photo_feeling_cute",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#EA91AD",
                                            "#FE88AE",
                                            "#FC2975",
                                            "#FF036D"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🌷",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Feeling Cute",
                                    "text_color": "#FFFFFFE5",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "Cutie Pie 🌸",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🎀"
                                    },
                                    "background": {
                                        "colors": [
                                            "#EDBCC6",
                                            "#FFBDCF",
                                            "#FEA3B2",
                                            "#FE9AA7"
                                        ]
                                    },
                                    "text_color": "#FFFFFF"
                                },
                                "overlay_id": "caption:phu_cutie_pie"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "Hello Kitty 🐱",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🌸"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FFC5D9",
                                            "#FFC4D1",
                                            "#FFB4CC",
                                            "#FEB9C9"
                                        ]
                                    },
                                    "text_color": "#FFFFFF"
                                },
                                "overlay_id": "caption:phu_hello_kitty"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "ngoan xinh iu của ai đây",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "💗"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FBC6D7",
                                            "#FFCADF",
                                            "#F3D7EC",
                                            "#F3D3EE"
                                        ]
                                    },
                                    "text_color": "#734159"
                                },
                                "overlay_id": "caption:phu_ngoan_xinh_iu_cua_ai_day"
                            },
                            {
                                "overlay_id": "caption:photo_xinh_dep_tuyet_voi",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#FB538C",
                                            "#EE5B9C",
                                            "#B27137",
                                            "#7C7FF9"
                                        ]
                                    },
                                    "icon": {
                                        "data": "💅",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Xinh đẹp tuyệt vời",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "hôm nay cũng slay",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "✨"
                                    },
                                    "background": {
                                        "colors": [
                                            "#CEBBEA",
                                            "#D4BFEF",
                                            "#EDCBE7",
                                            "#F1CAE5"
                                        ]
                                    },
                                    "text_color": "#534167"
                                },
                                "overlay_id": "caption:phu_hom_nay_cung_slay"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "✔️ Tinh hoa hội tụ",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "👌"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FFC800",
                                            "#FEC200",
                                            "#FF9602",
                                            "#FD8E00"
                                        ]
                                    },
                                    "text_color": "#FFFFFF"
                                },
                                "overlay_id": "caption:phu_tinh_hoa_hoi_tu"
                            },
                            {
                                "overlay_id": "caption:photo_xinh_gai_an_phim_1",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#FF5E63",
                                            "#FE5B67",
                                            "#E05E35",
                                            "#FF4491"
                                        ]
                                    },
                                    "icon": {
                                        "data": "💅",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Xinh gái ấn phím 1",
                                    "text_color": "#FFFFFF",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "xinh là một loại tài năng",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🎀"
                                    },
                                    "background": {
                                        "colors": [
                                            "#E4ACBF",
                                            "#FEB6CE",
                                            "#F8CDE9",
                                            "#F3D1ED"
                                        ]
                                    },
                                    "text_color": "#97647A"
                                },
                                "overlay_id": "caption:phu_xinh_la_mot_loai_tai_nang"
                            },
                            {
                                "overlay_id": "caption:photo_dep_trai_co_gi_sai",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#FF5300",
                                            "#FB6000",
                                            "#FFA600",
                                            "#FDAF00"
                                        ]
                                    },
                                    "icon": {
                                        "data": "😎",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Đẹp trai có gì sai",
                                    "text_color": "#000000E6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "đẹp không cần lý do",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🪞"
                                    },
                                    "background": {
                                        "colors": [
                                            "#EDBBD3",
                                            "#F2BFD4",
                                            "#EACCE9",
                                            "#EACCEB"
                                        ]
                                    },
                                    "text_color": "#693F54"
                                },
                                "overlay_id": "caption:phu_dep_khong_can_ly_do"
                            },
                            {
                                "overlay_id": "caption:photo_cha_nay_tu_luyen_ghe",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#E5E8F0",
                                            "#CBF3EF",
                                            "#FFCCD9",
                                            "#FDCDEA"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🪞",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Cha này tự luyến ghê",
                                    "text_color": "#000000E6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_phu_tinh_khong_phu_ban",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#931AED",
                                            "#8E17EC",
                                            "#6500E9",
                                            "#5B02E8"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🕶️",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Phụ tình không phụ bản",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "🤚 main character của cuộ…",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "😒"
                                    },
                                    "background": {
                                        "colors": [
                                            "#DBBDE7",
                                            "#E8BDE2",
                                            "#F0D3E1",
                                            "#F4D2DD"
                                        ]
                                    },
                                    "text_color": "#5B3C60"
                                },
                                "overlay_id": "caption:phu_main_character_cua_cuo"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "vibe này ko phải ai cũng có",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🪩"
                                    },
                                    "background": {
                                        "colors": [
                                            "#69DFF9",
                                            "#6DE8F7",
                                            "#B2F7E7",
                                            "#BFFEF2"
                                        ]
                                    },
                                    "text_color": "#004F50"
                                },
                                "overlay_id": "caption:phu_vibe_nay_ko_phai_ai_cung_co"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "không hoàn hảo nhưng có khí…",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "😎"
                                    },
                                    "background": {
                                        "colors": [
                                            "#B07F50",
                                            "#D79963",
                                            "#FEE2AC",
                                            "#FFE5AE"
                                        ]
                                    },
                                    "text_color": "#6F360C"
                                },
                                "overlay_id": "caption:phu_khong_hoan_hao_nhung_co_khi"
                            },
                            {
                                "overlay_id": "caption:photo_sieu_cap_ba_khi",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#FF2670",
                                            "#FF246B",
                                            "#FA2D47",
                                            "#FF2536"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🐉",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "siêu cấp bá khí",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "Bùng nổ",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "💥"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FF6A60",
                                            "#FF6E57",
                                            "#FFAD4D",
                                            "#FFBB47"
                                        ]
                                    },
                                    "text_color": "#851D00"
                                },
                                "overlay_id": "caption:phu_bung_no"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "bá khí ngang ngược",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "😎"
                                    },
                                    "background": {
                                        "colors": [
                                            "#93B2D3",
                                            "#9BBAD9",
                                            "#CDCAE8",
                                            "#D0C6E7"
                                        ]
                                    },
                                    "text_color": "#2E455D"
                                },
                                "overlay_id": "caption:phu_ba_khi_ngang_nguoc"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "Đủ bá khí chưa?",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "👑"
                                    },
                                    "background": {
                                        "colors": [
                                            "#D3B9E6",
                                            "#DBBDE5",
                                            "#F0D9EA",
                                            "#F3DBEE"
                                        ]
                                    },
                                    "text_color": "#7D6387"
                                },
                                "overlay_id": "caption:phu_u_ba_khi_chua"
                            },
                            {
                                "overlay_id": "caption:photo_oach_xa_lach",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#00A88A",
                                            "#00A17D",
                                            "#04DD74",
                                            "#00E772"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🥬",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "oách xà lách",
                                    "text_color": "#FFFFFF",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_cung_cung_di",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#FE6C37",
                                            "#FF703A",
                                            "#FFAB4B",
                                            "#FEB65C"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🚀",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Cũng cứng đi",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_ra_duong_ne_moi_anh",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#C1CCDF",
                                            "#C6CFE0",
                                            "#E3E3F0",
                                            "#E7E4F3"
                                        ]
                                    },
                                    "icon": {
                                        "data": "👤",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Ra đường nể mỗi anh",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_nhin_la_biet_uy_tin",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#017AAF",
                                            "#0271A9",
                                            "#18516E",
                                            "#244663"
                                        ]
                                    },
                                    "icon": {
                                        "data": "👌",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Nhìn là biết uy tín",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_flex_den_hoi_tho_cuoi",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#00BA9F",
                                            "#03D0B2",
                                            "#7CF9DF",
                                            "#92FAE5"
                                        ]
                                    },
                                    "icon": {
                                        "data": "💎",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Flex đến hơi thở cuối",
                                    "text_color": "#000000E6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "tui không hơn thua, tui hơn hẳ…",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "😎"
                                    },
                                    "background": {
                                        "colors": [
                                            "#AC1737",
                                            "#A4152A",
                                            "#EB5D64",
                                            "#F76E7A"
                                        ]
                                    },
                                    "text_color": "#FFFCF8"
                                },
                                "overlay_id": "caption:phu_tui_khong_hon_thua_tui_hon_ha"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "tui không hơn ai, tui hơn hôm…",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🫶"
                                    },
                                    "background": {
                                        "colors": [
                                            "#BCDBD2",
                                            "#C0DDD1",
                                            "#E3E2C9",
                                            "#E9E1CD"
                                        ]
                                    },
                                    "text_color": "#385144"
                                },
                                "overlay_id": "caption:phu_tui_khong_hon_ai_tui_hon_hom"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "không phải gu của tất cả, may…",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "💅"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FD6F91",
                                            "#FF7795",
                                            "#C97F18",
                                            "#FDC0B0"
                                        ]
                                    },
                                    "text_color": "#851E3A"
                                },
                                "overlay_id": "caption:phu_khong_phai_gu_cua_tat_ca_may"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "ủa tưởng mình quan trọng lắm…",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "💅"
                                    },
                                    "background": {
                                        "colors": [
                                            "#836CE8",
                                            "#8B73EF",
                                            "#C8936C",
                                            "#C6B6FB"
                                        ]
                                    },
                                    "text_color": "#FFFBFF"
                                },
                                "overlay_id": "caption:phu_ua_tuong_minh_quan_trong_lam"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "cái nết kỳ ghê",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "😒"
                                    },
                                    "background": {
                                        "colors": [
                                            "#BADD66",
                                            "#C4E26D",
                                            "#E3F2B2",
                                            "#E7F4B4"
                                        ]
                                    },
                                    "text_color": "#2B3E00"
                                },
                                "overlay_id": "caption:phu_cai_net_ky_ghe"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "ghét đứa kia ghê 😒",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "😒"
                                    },
                                    "background": {
                                        "colors": [
                                            "#586F87",
                                            "#657E8C",
                                            "#A0A9CA",
                                            "#AABFCE"
                                        ]
                                    },
                                    "text_color": "#FBFFFF"
                                },
                                "overlay_id": "caption:phu_ghet_dua_kia_ghe"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "không ghét, chỉ không ưa",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "😒"
                                    },
                                    "background": {
                                        "colors": [
                                            "#EEA139",
                                            "#FDB33C",
                                            "#FEE39E",
                                            "#FFE6AB"
                                        ]
                                    },
                                    "text_color": "#663700"
                                },
                                "overlay_id": "caption:phu_khong_ghet_chi_khong_ua"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "Tôi sống thế đấy",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "😎"
                                    },
                                    "background": {
                                        "colors": [
                                            "#2F3039",
                                            "#3F3644",
                                            "#838B9B",
                                            "#979EAB"
                                        ]
                                    },
                                    "text_color": "#FFFFFF"
                                },
                                "overlay_id": "caption:phu_toi_song_the_day"
                            },
                            {
                                "overlay_id": "caption:photo_che_manh",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#FE4F3D",
                                            "#FC6227",
                                            "#FFB103",
                                            "#FFC300"
                                        ]
                                    },
                                    "icon": {
                                        "data": "👎",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Chê mạnh",
                                    "text_color": "#FFFFFF",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_chua_du_wow",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#FFC8D7",
                                            "#FFBCD2",
                                            "#FFD0D2",
                                            "#FBD7D8"
                                        ]
                                    },
                                    "icon": {
                                        "data": "⭐",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Chưa đủ wow",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_roi_let_luon",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#FDADBF",
                                            "#FFBEE1",
                                            "#F4C8D9",
                                            "#C2BEF1"
                                        ]
                                    },
                                    "icon": {
                                        "data": "💅",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "rồi lét luôn",
                                    "text_color": "#000000E6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_roi_gay_luon",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#D16BE6",
                                            "#A06DF5",
                                            "#76E3B1",
                                            "#C5E281"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🌈",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "rồi gay luôn",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "ĐANG TRỰC TIẾP",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🔴"
                                    },
                                    "background": {
                                        "colors": [
                                            "#323232",
                                            "#342F31",
                                            "#312C2D",
                                            "#2B2D2C"
                                        ]
                                    },
                                    "text_color": "#FFFFFF"
                                },
                                "overlay_id": "caption:phu_ang_truc_tiep"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "ae sẵn sàn",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🚀"
                                    },
                                    "background": {
                                        "colors": [
                                            "#BEE0F0",
                                            "#BFE2ED",
                                            "#D0E1D9",
                                            "#CFEADF"
                                        ]
                                    },
                                    "text_color": "#385B66"
                                },
                                "overlay_id": "caption:phu_ae_san_san"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "ae tao ma cao",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "✈️"
                                    },
                                    "background": {
                                        "colors": [
                                            "#CCD4F3",
                                            "#C7CFE5",
                                            "#DCD9F5",
                                            "#E2CFEF"
                                        ]
                                    },
                                    "text_color": "#545575"
                                },
                                "overlay_id": "caption:phu_ae_tao_ma_cao"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "quậy rửa fen",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🎉"
                                    },
                                    "background": {
                                        "colors": [
                                            "#C1E5CB",
                                            "#C9DECE",
                                            "#DAE6C2",
                                            "#DFE9C6"
                                        ]
                                    },
                                    "text_color": "#4F6D4E"
                                },
                                "overlay_id": "caption:phu_quay_rua_fen"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "cũng fomo theo =))",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "👀"
                                    },
                                    "background": {
                                        "colors": [
                                            "#C0A4B9",
                                            "#D6B5CB",
                                            "#F2D0E0",
                                            "#F5D3E0"
                                        ]
                                    },
                                    "text_color": "#664661"
                                },
                                "overlay_id": "caption:phu_cung_fomo_theo"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "thế mà lại hay",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "💡"
                                    },
                                    "background": {
                                        "colors": [
                                            "#D4D7ED",
                                            "#C9C9F2",
                                            "#E5D7E7",
                                            "#E8D8E6"
                                        ]
                                    },
                                    "text_color": "#55516B"
                                },
                                "overlay_id": "caption:phu_the_ma_lai_hay"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "10 điểm không có nhưng",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🏆"
                                    },
                                    "background": {
                                        "colors": [
                                            "#F9D6A4",
                                            "#CD974A",
                                            "#FACAAD",
                                            "#FBCDC6"
                                        ]
                                    },
                                    "text_color": "#714D2E"
                                },
                                "overlay_id": "caption:phu_10_diem_khong_co_nhung"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "có tài ghê, tài lanh",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "👑"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FAC7B2",
                                            "#FAC9B3",
                                            "#EFD3B1",
                                            "#EFD5B2"
                                        ]
                                    },
                                    "text_color": "#6C472D"
                                },
                                "overlay_id": "caption:phu_co_tai_ghe_tai_lanh"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "nói ít thôi, làm nhiều lên",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🎯"
                                    },
                                    "background": {
                                        "colors": [
                                            "#C1E3D5",
                                            "#C3E3D3",
                                            "#D6E6CE",
                                            "#D9E8C7"
                                        ]
                                    },
                                    "text_color": "#698F7B"
                                },
                                "overlay_id": "caption:phu_noi_it_thoi_lam_nhieu_len"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "quyết k để mất chuỗi :))",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🔥"
                                    },
                                    "background": {
                                        "colors": [
                                            "#C3E2CE",
                                            "#8DC8A2",
                                            "#DAEBBE",
                                            "#DAE8BA"
                                        ]
                                    },
                                    "text_color": "#3C6442"
                                },
                                "overlay_id": "caption:phu_quyet_k_de_mat_chuoi"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "trừ điểm aura",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "📉"
                                    },
                                    "background": {
                                        "colors": [
                                            "#D5C9EB",
                                            "#D3D4EA",
                                            "#E5D0E5",
                                            "#ECCAE6"
                                        ]
                                    },
                                    "text_color": "#5D456B"
                                },
                                "overlay_id": "caption:phu_tru_diem_aura"
                            }
                        ]
                    },
                    {
                        "section": "🎨 Tình yêu & Thả thính 💕",
                        "items": [
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "đã xem, chưa rep, đã đau",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "📱"
                                    },
                                    "background": {
                                        "colors": [
                                            "#1F6EC8",
                                            "#507FAF",
                                            "#92CFED",
                                            "#9AD6FD"
                                        ]
                                    },
                                    "text_color": "#003463"
                                },
                                "overlay_id": "caption:phu_da_xem_chua_rep_da_dau"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "đừng im lặng với em mà",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🥺"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FF93AF",
                                            "#FF9CA3",
                                            "#FFC9DC",
                                            "#FAD4DF"
                                        ]
                                    },
                                    "text_color": "#86253F"
                                },
                                "overlay_id": "caption:phu_dung_im_lang_voi_em_ma"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "nhớ thì nhớ, quay lại thì thôi",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🙂"
                                    },
                                    "background": {
                                        "colors": [
                                            "#F0AD36",
                                            "#F3B44F",
                                            "#F8DE93",
                                            "#FEE2AC"
                                        ]
                                    },
                                    "text_color": "#663700"
                                },
                                "overlay_id": "caption:phu_nho_thi_nho_quay_lai_thi_thoi"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "em hong có dỗi, em chỉ buồn",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🥲"
                                    },
                                    "background": {
                                        "colors": [
                                            "#66AD04",
                                            "#70B800",
                                            "#BEDE7B",
                                            "#D0E790"
                                        ]
                                    },
                                    "text_color": "#224600"
                                },
                                "overlay_id": "caption:phu_em_hong_co_doi_em_chi_buon"
                            },
                            {
                                "overlay_id": "caption:photo_doi_roi",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#FF5E65",
                                            "#FD7256",
                                            "#F1AC6C",
                                            "#FDB45F"
                                        ]
                                    },
                                    "icon": {
                                        "data": "😤",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Dỗi rồi",
                                    "text_color": "#FFFFFF",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "thui mừ đừng có chọc bé",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🥺"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FBC2D5",
                                            "#F8C8DD",
                                            "#F2D7F2",
                                            "#F3D2F2"
                                        ]
                                    },
                                    "text_color": "#724659"
                                },
                                "overlay_id": "caption:phu_thui_mu_dung_co_choc_be"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "đừng có làm bé quạo",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "😾"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FD8F50",
                                            "#F99A43",
                                            "#FECA83",
                                            "#FED28D"
                                        ]
                                    },
                                    "text_color": "#812C00"
                                },
                                "overlay_id": "caption:phu_dung_co_lam_be_quao"
                            },
                            {
                                "overlay_id": "caption:photo_xin_lui_duoc_chua",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#E2B550",
                                            "#F3BC4D",
                                            "#FDA67F",
                                            "#FCA479"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🥺",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Xin lũi được chưa",
                                    "text_color": "#000000",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "bíc gòi khổ lém",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🥲"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FD7C56",
                                            "#FF895D",
                                            "#FFC88A",
                                            "#FED28F"
                                        ]
                                    },
                                    "text_color": "#8C4116"
                                },
                                "overlay_id": "caption:phu_bic_goi_kho_lem"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "hong bé ơi",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🥹"
                                    },
                                    "background": {
                                        "colors": [
                                            "#3BD1AA",
                                            "#5AD9B1",
                                            "#B7F2CE",
                                            "#C6F2D1"
                                        ]
                                    },
                                    "text_color": "#01553B"
                                },
                                "overlay_id": "caption:phu_hong_be_oi"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "khum có bíc nữa",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🫠"
                                    },
                                    "background": {
                                        "colors": [
                                            "#6078D6",
                                            "#7582DB",
                                            "#B3C0F9",
                                            "#C8CBFF"
                                        ]
                                    },
                                    "text_color": "#25387B"
                                },
                                "overlay_id": "caption:phu_khum_co_bic_nua"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "cái đéo má ??",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🤬"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FC6A5D",
                                            "#FF7249",
                                            "#FFB250",
                                            "#FDBF4E"
                                        ]
                                    },
                                    "text_color": "#721900"
                                },
                                "overlay_id": "caption:phu_cai_deo_ma"
                            },
                            {
                                "overlay_id": "caption:photo_cai_gi_vay_troi",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#FF5315",
                                            "#FD621B",
                                            "#FFB345",
                                            "#FEBF4E"
                                        ]
                                    },
                                    "icon": {
                                        "data": "❗",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Cái gì vậy trời",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_khong_the_tin_noi",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#4363FC",
                                            "#5362FF",
                                            "#A082FF",
                                            "#AB92FF"
                                        ]
                                    },
                                    "icon": {
                                        "data": "❓",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Không thể tin nổi",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_vl_m_oi",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#2E3343",
                                            "#3D374C",
                                            "#848BA4",
                                            "#96A0B4"
                                        ]
                                    },
                                    "icon": {
                                        "data": "😳",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "vl m ơi?",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_ua_alo_1",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#FFB631",
                                            "#FEBB37",
                                            "#FDE07C",
                                            "#FFE594"
                                        ]
                                    },
                                    "icon": {
                                        "data": "📞",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Ủa alo",
                                    "text_color": "#FFFFFF",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "Ủa alo, gì dạ?",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "😭"
                                    },
                                    "background": {
                                        "colors": [
                                            "#00B5A1",
                                            "#08BF9D",
                                            "#6AE3C6",
                                            "#8CE6CE"
                                        ]
                                    },
                                    "text_color": "#005350"
                                },
                                "overlay_id": "caption:phu_ua_alo_gi_da"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "hở?",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🤨"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FD3448",
                                            "#F54646",
                                            "#FF9285",
                                            "#FE9F8D"
                                        ]
                                    },
                                    "text_color": "#7F0009"
                                },
                                "overlay_id": "caption:phu_ho"
                            },
                            {
                                "overlay_id": "caption:photo_lai_phai_lo",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#6ECCAE",
                                            "#87CEA1",
                                            "#D9EF9F",
                                            "#E9F19F"
                                        ]
                                    },
                                    "icon": {
                                        "data": "💔",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "lại phải lọ",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "nói chuyện nghe mắc mệt",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🫠"
                                    },
                                    "background": {
                                        "colors": [
                                            "#65506C",
                                            "#7F5B73",
                                            "#C49DBC",
                                            "#CBA6C7"
                                        ]
                                    },
                                    "text_color": "#FFF9FF"
                                },
                                "overlay_id": "caption:phu_noi_chuyen_nghe_mac_met"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "đúng là hết nói nổi",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🙄"
                                    },
                                    "background": {
                                        "colors": [
                                            "#5C8354",
                                            "#66895B",
                                            "#B1CB90",
                                            "#C3DB9D"
                                        ]
                                    },
                                    "text_color": "#183E18"
                                },
                                "overlay_id": "caption:phu_dung_la_het_noi_noi"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "Chạn bố mày đi",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🙄"
                                    },
                                    "background": {
                                        "colors": [
                                            "#87006D",
                                            "#9C0054",
                                            "#EF404B",
                                            "#FF564C"
                                        ]
                                    },
                                    "text_color": "#FFF5FF"
                                },
                                "overlay_id": "caption:phu_chan_bo_may_di"
                            },
                            {
                                "overlay_id": "caption:photo_tuyet_doi_khong_nghe",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#FF2161",
                                            "#FF235A",
                                            "#FE2C25",
                                            "#FF2F24"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🙉",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Tuyệt đối không nghe",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "không biết, không thấy, không…",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🙈"
                                    },
                                    "background": {
                                        "colors": [
                                            "#CCDCC9",
                                            "#D0DDC6",
                                            "#EBD0B5",
                                            "#F3DBC7"
                                        ]
                                    },
                                    "text_color": "#46533F"
                                },
                                "overlay_id": "caption:phu_khong_biet_khong_thay_khong"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "nói ít thôi, lộ hết bây giờ",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🤫"
                                    },
                                    "background": {
                                        "colors": [
                                            "#016873",
                                            "#086750",
                                            "#73BBB0",
                                            "#8CD0C2"
                                        ]
                                    },
                                    "text_color": "#004A4F"
                                },
                                "overlay_id": "caption:phu_noi_it_thoi_lo_het_bay_gio"
                            },
                            {
                                "overlay_id": "caption:photo_nguoi_im_lang_gap_nguoi_hay_noi",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#2F3133",
                                            "#373A37",
                                            "#839394",
                                            "#9CA5B4"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🤐",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Người im lặng gặp người hay nói",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "Nói hết bí mật thì có yêu hong",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🤫"
                                    },
                                    "background": {
                                        "colors": [
                                            "#B395B4",
                                            "#D0A2B8",
                                            "#D6CEE3",
                                            "#CCD3EE"
                                        ]
                                    },
                                    "text_color": "#78566F"
                                },
                                "overlay_id": "caption:phu_noi_het_bi_mat_thi_co_yeu_hong"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "ê nha má",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "💬"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FCC1C3",
                                            "#FEBFBB",
                                            "#F7BBCD",
                                            "#F5C2DA"
                                        ]
                                    },
                                    "text_color": "#733B47"
                                },
                                "overlay_id": "caption:phu_e_nha_ma"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "ê ????",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "❔"
                                    },
                                    "background": {
                                        "colors": [
                                            "#C8E0E8",
                                            "#C8DFEC",
                                            "#E1DDF3",
                                            "#DCDFEA"
                                        ]
                                    },
                                    "text_color": "#596D7B"
                                },
                                "overlay_id": "caption:phu_e"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "chịu luôn á",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🤷"
                                    },
                                    "background": {
                                        "colors": [
                                            "#D5D1E9",
                                            "#D9D1E8",
                                            "#E6D5E8",
                                            "#E7D4E8"
                                        ]
                                    },
                                    "text_color": "#5B506A"
                                },
                                "overlay_id": "caption:phu_chiu_luon_a"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "điên đầu quá đi mất",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🧠"
                                    },
                                    "background": {
                                        "colors": [
                                            "#D8C7ED",
                                            "#E5C5F2",
                                            "#EDC8DB",
                                            "#EEC9DC"
                                        ]
                                    },
                                    "text_color": "#654967"
                                },
                                "overlay_id": "caption:phu_dien_dau_qua_di_mat"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "❔ mắc mệt quá m ơi",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🎲"
                                    },
                                    "background": {
                                        "colors": [
                                            "#E0C8E7",
                                            "#DDCBE8",
                                            "#E9CDE1",
                                            "#ECCBE1"
                                        ]
                                    },
                                    "text_color": "#614865"
                                },
                                "overlay_id": "caption:phu_mac_met_qua_m_oi"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "ý là mệt á 🥲",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "☁️"
                                    },
                                    "background": {
                                        "colors": [
                                            "#C6DDE8",
                                            "#C7DEE9",
                                            "#D7E5E3",
                                            "#DAE4E3"
                                        ]
                                    },
                                    "text_color": "#435B63"
                                },
                                "overlay_id": "caption:phu_y_la_met_a"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "lại một mình nầy",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🥲"
                                    },
                                    "background": {
                                        "colors": [
                                            "#CCCFE5",
                                            "#CCD4E6",
                                            "#D7D6E9",
                                            "#E0D3EA"
                                        ]
                                    },
                                    "text_color": "#504C67"
                                },
                                "overlay_id": "caption:phu_lai_mot_minh_nay"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "alone 😭",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🌙"
                                    },
                                    "background": {
                                        "colors": [
                                            "#CCCDE5",
                                            "#CFCDE5",
                                            "#DDCDEB",
                                            "#E3CFE4"
                                        ]
                                    },
                                    "text_color": "#57506B"
                                },
                                "overlay_id": "caption:phu_alone"
                            }
                        ]
                    },
                    {
                        "section": "🎨 Daily & Đời thường ☕",
                        "items": [
                            {
                                "overlay_id": "caption:photo_ngay_moi_vui_ve",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#FFB902",
                                            "#FEC000",
                                            "#FCE47D",
                                            "#FCE38C"
                                        ]
                                    },
                                    "icon": {
                                        "data": "☀️",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Ngày mới vui vẻ",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_coffee_time",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#5A3C31",
                                            "#604139",
                                            "#895A53",
                                            "#8D635A"
                                        ]
                                    },
                                    "icon": {
                                        "data": "☕",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Coffee Time!",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "Matcha Latte 🍵",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🍃"
                                    },
                                    "background": {
                                        "colors": [
                                            "#B8E3B9",
                                            "#B0E0B7",
                                            "#81D08D",
                                            "#75CB8A"
                                        ]
                                    },
                                    "text_color": "#045B1E"
                                },
                                "overlay_id": "caption:phu_matcha_latte"
                            },
                            {
                                "overlay_id": "caption:photo_mixue_time",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#FEF2BF",
                                            "#FEE9C3",
                                            "#FFC6D0",
                                            "#FFBFD1"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🍦",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Mixue Time!",
                                    "text_color": "#000000E6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "tiền không mua được tất cả, n…",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🧋"
                                    },
                                    "background": {
                                        "colors": [
                                            "#E0BE81",
                                            "#E8C588",
                                            "#F5E0BA",
                                            "#F6E0BF"
                                        ]
                                    },
                                    "text_color": "#644C27"
                                },
                                "overlay_id": "caption:phu_tien_khong_mua_duoc_tat_ca_n"
                            },
                            {
                                "overlay_id": "caption:photo_an_com_chua",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#FF8B01",
                                            "#FF8B00",
                                            "#FC7C01",
                                            "#FF7A03"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🍽️",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Ăn cơm chưa?",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_dinner_time",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#FFBFB1",
                                            "#FFBBAE",
                                            "#FB908E",
                                            "#FE8B80"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🍽️",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Dinner Time!",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_di_choi_khong",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#8F1543",
                                            "#8B3761",
                                            "#E0005A",
                                            "#DB025B"
                                        ]
                                    },
                                    "icon": {
                                        "data": "✈️",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Đi chơi không?",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "tuyệt vời, uống nào!",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🥂"
                                    },
                                    "background": {
                                        "colors": [
                                            "#F6C891",
                                            "#F4CD96",
                                            "#F8CCB2",
                                            "#F9C7B4"
                                        ]
                                    },
                                    "text_color": "#7E5837"
                                },
                                "overlay_id": "caption:phu_tuyet_voi_uong_nao"
                            },
                            {
                                "overlay_id": "caption:photo_shopping_time",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#AFE9FE",
                                            "#D3D6FE",
                                            "#F6F4FE",
                                            "#FAFAFE"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🛍️",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Shopping Time!",
                                    "text_color": "#000000E6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_cinema_time",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#1D2B7C",
                                            "#1E2F7E",
                                            "#3B4E61",
                                            "#3A5265"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🎬",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Cinema Time!",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_tuyet_doi_dien_anh",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#3C545E",
                                            "#37515D",
                                            "#2B383C",
                                            "#2B373E"
                                        ]
                                    },
                                    "icon": {
                                        "data": "📷",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Tuyệt đối điện ảnh",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_qua_la_dien_anh",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#02A698",
                                            "#00A397",
                                            "#00917F",
                                            "#00907F"
                                        ]
                                    },
                                    "icon": {
                                        "data": "📷",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Quá là điện ảnh",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_locket_time",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#E5EDF3",
                                            "#D9EEF7",
                                            "#B6E7FF",
                                            "#AFE7FD"
                                        ]
                                    },
                                    "icon": {
                                        "data": "📷",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Locket Time!",
                                    "text_color": "#000000E6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_chilling_time",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#EDBDE9",
                                            "#D3CCAE",
                                            "#FCB9D8",
                                            "#FDB9D4"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🌴",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Chilling Time!",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "mai tính, nay ngủ",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "💀"
                                    },
                                    "background": {
                                        "colors": [
                                            "#424A50",
                                            "#464F55",
                                            "#929AA3",
                                            "#9BA6B2"
                                        ]
                                    },
                                    "text_color": "#FBFFFF"
                                },
                                "overlay_id": "caption:phu_mai_tinh_nay_ngu"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "offline để hồi sinh",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "💤"
                                    },
                                    "background": {
                                        "colors": [
                                            "#028B93",
                                            "#0C9FA0",
                                            "#BEE8E3",
                                            "#D8EEF0"
                                        ]
                                    },
                                    "text_color": "#004D4B"
                                },
                                "overlay_id": "caption:phu_offline_de_hoi_sinh"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "xin mờii",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "👋"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FCB8D3",
                                            "#FFC0C2",
                                            "#E5C5F0",
                                            "#E3C8F3"
                                        ]
                                    },
                                    "text_color": "#67395B"
                                },
                                "overlay_id": "caption:phu_xin_moii"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "hé lô cả nhà iu",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "💗"
                                    },
                                    "background": {
                                        "colors": [
                                            "#F9C3DE",
                                            "#E39DC5",
                                            "#E6CBF2",
                                            "#DECFF2"
                                        ]
                                    },
                                    "text_color": "#744A6D"
                                },
                                "overlay_id": "caption:phu_he_lo_ca_nha_iu"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "cả nhà thấy em cute hong ạ",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🙂"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FBC6D5",
                                            "#FEC7D8",
                                            "#F9D7C9",
                                            "#FDD7C6"
                                        ]
                                    },
                                    "text_color": "#74484E"
                                },
                                "overlay_id": "caption:phu_ca_nha_thay_em_cute_hong_a"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "cơm nước gì chưa người đẹp",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🍚"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FDC9B4",
                                            "#F9CAB8",
                                            "#F8D9B6",
                                            "#F7DEBE"
                                        ]
                                    },
                                    "text_color": "#906B51"
                                },
                                "overlay_id": "caption:phu_com_nuoc_gi_chua_nguoi_dep"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "ăn nhó",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🍜"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FFCFA4",
                                            "#FFCFA4",
                                            "#FBBDA7",
                                            "#FEB7A8"
                                        ]
                                    },
                                    "text_color": "#7A4328"
                                },
                                "overlay_id": "caption:phu_an_nho"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "chụp mới cho ăn",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "📷"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FFC6A6",
                                            "#FDCBAE",
                                            "#FCD9B5",
                                            "#FBDDB8"
                                        ]
                                    },
                                    "text_color": "#6E462D"
                                },
                                "overlay_id": "caption:phu_chup_moi_cho_an"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "nhăm nhăm",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🎂"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FFD1A1",
                                            "#FFCC9E",
                                            "#FEBF9E",
                                            "#FCC0A0"
                                        ]
                                    },
                                    "text_color": "#7F4D2E"
                                },
                                "overlay_id": "caption:phu_nham_nham"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "lạnh thấy mẹ 🥶",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "❄️"
                                    },
                                    "background": {
                                        "colors": [
                                            "#BADFEB",
                                            "#BCE1F0",
                                            "#CCE6F0",
                                            "#CFE7F1"
                                        ]
                                    },
                                    "text_color": "#7D9DAB"
                                },
                                "overlay_id": "caption:phu_lanh_thay_me"
                            },
                            {
                                "overlay_id": "caption:photo_ca_o_ran_doc",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#0B2F23",
                                            "#003D24",
                                            "#2B9035",
                                            "#27A54F"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🐍",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Cả ổ rắn độc",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_nghien_cuu_khoa_hoc",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#092830",
                                            "#0F2D37",
                                            "#174958",
                                            "#224E68"
                                        ]
                                    },
                                    "icon": {
                                        "data": "☕",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Cần nạp cafein gấp",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_tien_dau_ma_tieu",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#01A78C",
                                            "#00AD85",
                                            "#00DF7C",
                                            "#03E874"
                                        ]
                                    },
                                    "icon": {
                                        "data": "💸",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Tiền đâu mà tiêu",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_luc_nao_co_tien_thi_moi_di_a",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#0A262E",
                                            "#0F2D35",
                                            "#154B5B",
                                            "#1D4C5E"
                                        ]
                                    },
                                    "icon": {
                                        "data": "💸",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Lúc nào có tiền thì mới đi á",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_doc_so_tai_khoan",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#019CFE",
                                            "#01A0FF",
                                            "#00C6FE",
                                            "#00CDFF"
                                        ]
                                    },
                                    "icon": {
                                        "data": "💳",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "đọc số tài khoản",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_co_tien_lam_phien_thien_ha",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#D3AB76",
                                            "#D7B58A",
                                            "#F3E0C9",
                                            "#F8E4CF"
                                        ]
                                    },
                                    "icon": {
                                        "data": "💰",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Có tiền làm phiền thiên hạ",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "có tiền thì nói chuyện tiếp",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "💸"
                                    },
                                    "background": {
                                        "colors": [
                                            "#006D5F",
                                            "#0C8576",
                                            "#54C8AA",
                                            "#80D5B6"
                                        ]
                                    },
                                    "text_color": "#D6FFFF"
                                },
                                "overlay_id": "caption:phu_co_tien_thi_noi_chuyen_tiep"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "độc lập tài chính, độc thân tìn…",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "💰"
                                    },
                                    "background": {
                                        "colors": [
                                            "#ABB89D",
                                            "#D0D3B0",
                                            "#E6DCB7",
                                            "#E9DBB7"
                                        ]
                                    },
                                    "text_color": "#3D4C33"
                                },
                                "overlay_id": "caption:phu_doc_lap_tai_chinh_doc_than_tin"
                            },
                            {
                                "overlay_id": "caption:photo_cu_tu_tu_khoai_se_nhu",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#3EB40F",
                                            "#769421",
                                            "#86D53F",
                                            "#8CD944"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🥔",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Cứ từ từ khoai sẽ nhừ",
                                    "text_color": "#000000E6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "overlay_id": "caption:photo_kiem_tra_nhan_pham",
                                "source": "remote",
                                "caption": {
                                    "background": {
                                        "colors": [
                                            "#7F5AAD",
                                            "#7A5E9C",
                                            "#D694BE",
                                            "#E3A2C5"
                                        ]
                                    },
                                    "icon": {
                                        "data": "🎲",
                                        "type": "emoji"
                                    },
                                    "max_lines": 1,
                                    "text": "Kiểm tra nhân phẩm",
                                    "text_color": "#FFFFFFE6",
                                    "type": "static_content"
                                }
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "gấc buồn ngủ",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "💤"
                                    },
                                    "background": {
                                        "colors": [
                                            "#CFD3F1",
                                            "#D3D3F0",
                                            "#E6D6F3",
                                            "#E9D8F0"
                                        ]
                                    },
                                    "text_color": "#555678"
                                },
                                "overlay_id": "caption:phu_gac_buon_ngu"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "lười học quâa",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "📚"
                                    },
                                    "background": {
                                        "colors": [
                                            "#DEC4F4",
                                            "#D6CFDD",
                                            "#EECEEB",
                                            "#F0D2E7"
                                        ]
                                    },
                                    "text_color": "#61466F"
                                },
                                "overlay_id": "caption:phu_luoi_hoc_quaa"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "+1 máy bị deadline dí 🏃🏻‍♂️💨",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "🏃"
                                    },
                                    "background": {
                                        "colors": [
                                            "#F9C5B4",
                                            "#F7C8B4",
                                            "#EED2AE",
                                            "#EED3B3"
                                        ]
                                    },
                                    "text_color": "#6D4A33"
                                },
                                "overlay_id": "caption:phu_1_may_bi_deadline_di"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "cháy ví",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "💸"
                                    },
                                    "background": {
                                        "colors": [
                                            "#F9C3B3",
                                            "#F5C4B2",
                                            "#F5CDB6",
                                            "#F1CFB6"
                                        ]
                                    },
                                    "text_color": "#835646"
                                },
                                "overlay_id": "caption:phu_chay_vi"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "🏃 hết tiền vì cái này =))",
                                    "icon": {
                                        "type": "emoji",
                                        "data": "📚"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FFC2B4",
                                            "#EFCBAE",
                                            "#F5C2C3",
                                            "#EEC5C5"
                                        ]
                                    },
                                    "text_color": "#A6736B"
                                },
                                "overlay_id": "caption:phu_het_tien_vi_cai_nay"
                            }
                        ]
                    },
                    {
                        "section": "🎨 Chứng nhận của Locket",
                        "items": [
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "Locket xác nhận bạn cutii",
                                    "icon": {
                                        "type": "sf_symbol",
                                        "data": "checkmark.seal.fill",
                                        "color": "#FFFFFF"
                                    },
                                    "background": {
                                        "colors": [
                                            "#02B3F0",
                                            "#02B3EC",
                                            "#00ACE3",
                                            "#00A7E0"
                                        ]
                                    },
                                    "text_color": "#FFFFFF"
                                },
                                "overlay_id": "caption:phu_locket_xac_nhan_ban_cutii"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "Locket xác nhận bạn xinh gái",
                                    "icon": {
                                        "type": "sf_symbol",
                                        "data": "checkmark.seal.fill",
                                        "color": "#FFFFFF"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FFD036",
                                            "#FFCD31",
                                            "#FFB304",
                                            "#FFBB00"
                                        ]
                                    },
                                    "text_color": "#FFFFFF"
                                },
                                "overlay_id": "caption:phu_locket_xac_nhan_ban_xinh_gai"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "Locket xác nhận bạn đẹp chai",
                                    "icon": {
                                        "type": "sf_symbol",
                                        "data": "checkmark.seal.fill",
                                        "color": "#FFFFFF"
                                    },
                                    "background": {
                                        "colors": [
                                            "#008BED",
                                            "#0089EC",
                                            "#0774E6",
                                            "#007AE0"
                                        ]
                                    },
                                    "text_color": "#FFFFFF"
                                },
                                "overlay_id": "caption:phu_locket_xac_nhan_ban_dep_chai"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "Locket xác nhận bạn dangiu",
                                    "icon": {
                                        "type": "sf_symbol",
                                        "data": "checkmark.seal.fill",
                                        "color": "#FFFFFF"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FD5187",
                                            "#FF4F89",
                                            "#FF3879",
                                            "#FF3374"
                                        ]
                                    },
                                    "text_color": "#FFFFFF"
                                },
                                "overlay_id": "caption:phu_locket_xac_nhan_ban_dangiu"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "Đã xác minh bạn là gái đẹp",
                                    "icon": {
                                        "type": "sf_symbol",
                                        "data": "checkmark.seal.fill",
                                        "color": "#FFFFFF"
                                    },
                                    "background": {
                                        "colors": [
                                            "#FF86AD",
                                            "#FF84AD",
                                            "#FE70A0",
                                            "#FE6E9C"
                                        ]
                                    },
                                    "text_color": "#FFFFFF"
                                },
                                "overlay_id": "caption:phu_a_xac_minh_ban_la_gai_dep"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "Đã xác minh bạn là trai đẹp",
                                    "icon": {
                                        "type": "sf_symbol",
                                        "data": "checkmark.seal.fill",
                                        "color": "#FFFFFF"
                                    },
                                    "background": {
                                        "colors": [
                                            "#109CF6",
                                            "#0D99F2",
                                            "#0089E9",
                                            "#0085E3"
                                        ]
                                    },
                                    "text_color": "#FFFFFF"
                                },
                                "overlay_id": "caption:phu_a_xac_minh_ban_la_trai_dep"
                            },
                            {
                                "source": "remote",
                                "caption": {
                                    "type": "static_content",
                                    "max_lines": 1,
                                    "text": "Đã xác nhận bạn là bé ngoan",
                                    "icon": {
                                        "type": "sf_symbol",
                                        "data": "checkmark.seal.fill",
                                        "color": "#FFFFFF"
                                    },
                                    "background": {
                                        "colors": [
                                            "#F0B5C2",
                                            "#F1B1C2",
                                            "#FDFBFC",
                                            "#FDFBFC"
                                        ]
                                    },
                                    "text_color": "#FFFFFF"
                                },
                                "overlay_id": "caption:phu_a_xac_nhan_ban_la_be_ngoan"
                            }
                        ]
                    }
            ])
    });
}

$done({ body: JSON.stringify(obj) });
